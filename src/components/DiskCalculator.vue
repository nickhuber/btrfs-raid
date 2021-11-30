<template>
  <div class="container">
    <h1>btrfs RAID Disk Calculator</h1>
    <hr>
    <h2>Disks</h2>
    <button
      type="button"
      class="btn btn-primary"
      @click="addDisk(4)"
    >
      Add disk
    </button>
    <div
      v-for="disk in disks"
      :key="disk.id"
    >
    <div class="row padded-row">
      <div class="col" />
      <div class="col-md-3 align-self-center">
          <div class="input-group">
            <input
              v-model="disk.size"
              type="number"
              class="form-control"
            >
            <span
              id="basic-addon1"
              class="input-group-text"
            >TiB</span>
            <button
              class="btn btn-danger"
              @click="removeDisk(disk.id)"
            >
              ╳
            </button>
          </div>
        </div>
      <div class="col" />
      </div>
    </div>

    <hr>

    <h2>RAID levels</h2>
    <table class="table">
      <thead class="table-light">
        <tr>
          <th>RAID level</th>
          <th>Available space</th>
          <th>Mirror / parity space</th>
          <th>Unusable space</th>
          <th>% usable</th>
        </tr>
      </thead>
      <tbody
        v-for="raid in getRAIDLevels()"
        :key="raid.name"
      >
        <tr>
          <td rowspan="2">
            {{ raid.name }}
            <span
              v-if="!raid.stable"
              class="badge rounded-pill bg-danger"
            >Unstable</span>
          </td>
          <td v-if="raid.usage">
            {{ raid.usage[0]?.toFixed(1) }} TiB
          </td>
          <td v-if="raid.usage">
            {{ raid.usage[1]?.toFixed(1) }} TiB
          </td>
          <td v-if="raid.usage">
            {{ raid.usage[2]?.toFixed(1) }} TiB
          </td>
          <td v-if="raid.usage">
            {{ (raid.usage[0] / getTotalSize() * 100).toFixed(1) }}%
          </td>
        </tr>
        <tr v-if="raid.usage">
          <td colspan="4">
            <div class="progress">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{ width: `${raid.usage[0] / getTotalSize() * 100}%` }"
              />
              <div
                class="progress-bar bg-warning"
                role="progressbar"
                :style="{ width: `${raid.usage[1] / getTotalSize() * 100}%` }"
              />
              <div
                class="progress-bar bg-danger"
                role="progressbar"
                :style="{ width: `${raid.usage[2] / getTotalSize() * 100}%` }"
              />
            </div>
          </td>
        </tr>
        <tr v-if="!raid.usage">
          <td
            rowspan="2"
            colspan="4"
          >
            Add more disks
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Notes</h2>
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        This excludes metadata, so won't be fully correct.
      </li>
      <li class="list-group-item">
        I probably don't know what I'm talking about.
      </li>
      <li class="list-group-item">
        <a href="https://www.carfax.org.uk/btrfs-usage/">https://www.carfax.org.uk/btrfs-usage/</a> is probably a better resource.
      </li>
    </ul>
  </div>
</template>



<script lang="ts">
import { Vue } from 'vue-class-component';

let _id: number = 0;

class Disk {
  size: number
  id: number

  constructor(size: number) {
    this.size = size;
    this.id = _id++;
  }
}


class RAIDFunction {
  name: string;
  stable: boolean
  usage: number[] | null;

  constructor(name: string, stable: boolean, usage: number[] | null) {
    this.name = name;
    this.stable = stable;
    this.usage = usage;
  }
}


export default class DiskCalculator extends Vue {
  disks: Disk[] = [];

  addDisk(size: number = 4) {
    this.disks.push(new Disk(size));
  }

  removeDisk(id: number) {
    for (let i = 0; i < this.disks.length; i++) {
      if (this.disks[i].id == id) {
        this.disks.splice(i, 1);
        return;
      }
    }
  }

  getTotalSize(): number {
    let total = 0
    for (let disk of this.disks) {
      total += disk.size;
    }
    return total
  }

  diskSizes(): number[] {
    // Get a sorted list of the disk sizes
    let sizes = [];
    for (let d of this.disks) {
      sizes.push(d.size);
    }
    sizes.sort((a: number, b: number) => b - a)
    return sizes;
  }

  RAIDCalculation(extra_copies: number): number[] | null {
    if (this.disks.length < extra_copies + 1) {
      return null;
    }
    // find the smallest disk, and stripe that same space on the disks with the most available size
    // https://www.spinics.net/lists/linux-btrfs/msg09832.html
    // https://btrfs.wiki.kernel.org/index.php/Manpage/mkfs.btrfs#PROFILES
    let disks = this.diskSizes();
    let usedSpace = 0;

    for (; ;) {
      usedSpace += disks[disks.length - 1];

      for (let i = 0; i < extra_copies; i++) {
        disks[i] -= disks[disks.length - 1];
      }
      disks.pop();

      disks.sort((a: number, b: number) => b - a)

      while (disks[disks.length - 1] === 0) {
        disks.pop();
      }
      if (disks.length < extra_copies + 1) {
        break;
      }
    }
    return [
      usedSpace,  // How much space is available for use
      usedSpace * extra_copies,  // How much space is used for copies of data
      this.getTotalSize() - usedSpace - (usedSpace * extra_copies)  // How much space was unusable
    ];
  }

  getRAIDLevels(): RAIDFunction[] {
    return [
      new RAIDFunction('Single', true, this.single),
      new RAIDFunction('DUP', true, this.dup),
      new RAIDFunction('RAID1', true, this.RAID1),
      new RAIDFunction('RAID1c3', true, this.RAID1c3),
      new RAIDFunction('RAID1c4', true, this.RAID1c4),
    ]
  }

  get single(): number[] | null {
    if (this.disks.length < 1) {
      return null;
    }
    return [this.getTotalSize(), 0, 0];
  }

  get dup(): number[] | null {
    if (this.disks.length < 1) {
      return null;
    }
    return [this.getTotalSize() / 2, this.getTotalSize() / 2, 0];
  }


  get RAID1(): number[] | null {
    return this.RAIDCalculation(1);
  }

  get RAID1c3(): number[] | null {
    return this.RAIDCalculation(2);
  }

  get RAID1c4(): number[] | null {
    return this.RAIDCalculation(3);
  }
}
</script>

<style scoped>
dfn {
  border-bottom: 1px dotted #232323;
  display: inline-block;
}
.padded-row {
  padding-top: 1ex;
}
</style>
