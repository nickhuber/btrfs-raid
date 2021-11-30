import { shallowMount } from '@vue/test-utils'
import DiskCalculator from '@/components/DiskCalculator.vue'


describe('DiskCalculator.vue Test', () => {
    const wrapper = shallowMount(DiskCalculator);

    beforeEach(() => {
        wrapper.vm.disks = [];
    })

    describe('calculates RAID1 properly', () => {
        it('says 5gb + 2gb + 1gb has 3gb usable, 3gb for mirroring and 2gb unusable', () => {
            wrapper.vm.addDisk(5);
            wrapper.vm.addDisk(2);
            wrapper.vm.addDisk(1);
            expect(wrapper.vm.RAID1).toEqual([3, 3, 2])
        })
    })

    describe('calculates RAID1c3 properly', () => {
        it('says 1gb + 2gb + 3gb + 4gb has 3gb usable, 6gb for mirroring and 1gb unusable', () => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(2);
            wrapper.vm.addDisk(3);
            wrapper.vm.addDisk(4);
            expect(wrapper.vm.RAID1c3).toEqual([3, 6, 1])
        })
        it('says 1gb + 1gb + 3gb + 4gb has 2gb usable, 4gb for mirroring and 3gb unusable', () => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(3);
            wrapper.vm.addDisk(4);
            expect(wrapper.vm.RAID1c3).toEqual([2, 4, 3])
        })
    })

    describe('calculates RAID1c4 properly', () => {
        it('says 1gb + 1gb + 3gb + 4gb has 1gb usable, 3gb for mirroring and 5gb unusable', () => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(3);
            wrapper.vm.addDisk(4);
            expect(wrapper.vm.RAID1c4).toEqual([1, 3, 5])
        })
    })

    describe('with no disks', () => {
        it('is null for single', () => {
            expect(wrapper.vm.single).toBeNull()
        })
        it('is null for dup', () => {
            expect(wrapper.vm.dup).toBeNull()
        })
        it('is null for RAID1', () => {
            expect(wrapper.vm.RAID1).toBeNull()
        })
        it('is null for RAID1c3', () => {
            expect(wrapper.vm.RAID1c3).toBeNull()
        })
        it('is null for RAID1c4', () => {
            expect(wrapper.vm.RAID1c4).toBeNull()
        })
    })

    describe('with 1 disk', () => {
        beforeEach(() => {
            wrapper.vm.addDisk(1);
        })

        it('is set for single', () => {
            console.log(wrapper.vm.disks)
            expect(wrapper.vm.single).not.toBeNull()
        })
        it('is set for dup', () => {
            expect(wrapper.vm.dup).not.toBeNull()
        })
        it('is null for RAID1', () => {
            expect(wrapper.vm.RAID1).toBeNull()
        })
        it('is null for RAID1c3', () => {
            expect(wrapper.vm.RAID1c3).toBeNull()
        })
        it('is null for RAID1c4', () => {
            expect(wrapper.vm.RAID1c4).toBeNull()
        })
    })

    describe('with 2 disks', () => {
        beforeEach(() => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
        })
        it('is set for single', () => {
            expect(wrapper.vm.single).not.toBeNull()
        })
        it('is set for dup', () => {
            expect(wrapper.vm.dup).not.toBeNull()
        })
        it('is set for RAID1', () => {
            expect(wrapper.vm.RAID1).not.toBeNull()
        })
        it('is null for RAID1c3', () => {
            expect(wrapper.vm.RAID1c3).toBeNull()
        })
        it('is null for RAID1c4', () => {
            expect(wrapper.vm.RAID1c4).toBeNull()
        })
    })

    describe('with 3 disks', () => {
        beforeEach(() => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
        })
        it('is set for single', () => {
            expect(wrapper.vm.single).not.toBeNull()
        })
        it('is set for dup', () => {
            expect(wrapper.vm.dup).not.toBeNull()
        })
        it('is set for RAID1', () => {
            expect(wrapper.vm.RAID1).not.toBeNull()
        })
        it('is set for RAID1c3', () => {
            expect(wrapper.vm.RAID1c3).not.toBeNull()
        })
        it('is null for RAID1c4', () => {
            expect(wrapper.vm.RAID1c4).toBeNull()
        })
    })

    describe('with 4 disks', () => {
        beforeEach(() => {
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
            wrapper.vm.addDisk(1);
        })
        it('is set for single', () => {
            expect(wrapper.vm.single).not.toBeNull()
        })
        it('is set for dup', () => {
            expect(wrapper.vm.dup).not.toBeNull()
        })
        it('is set for RAID1', () => {
            expect(wrapper.vm.RAID1).not.toBeNull()
        })
        it('is set for RAID1c3', () => {
            expect(wrapper.vm.RAID1c3).not.toBeNull()
        })
        it('is set for RAID1c4', () => {
            expect(wrapper.vm.RAID1c4).not.toBeNull()
        })
    })
})