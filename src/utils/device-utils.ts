import { checkIfGpuOrNpu, devices } from "@/models/resource";

export const getAvailRegularDeviceNumber = (deviceName: string, deviceQuota: number) => {
  if (checkIfGpuOrNpu(deviceName) === 'GPU') {
    const arr = [];
    for (let i = 0; i <= deviceQuota && i <= 8; i++) {
      arr.push(i);
    }
    return arr;
  }
  if (checkIfGpuOrNpu(deviceName) === 'NPU') {
    const arr = [0] 
    for (let i = 1; i <= deviceQuota; i *= 2) {
      if (i > 8) break;
      arr.push(i);
    }
    return arr;
  }
  return [];
};

export const getAvailPSDDeviceNumber = (deviceName: string, deviceQuota: number, nodeNumber: number) => {
  const capacitys = devices[deviceName]?.detail?.map(val => val.capacity);
  capacitys.sort((x, y) => y - x);
  console.log('capacitys', capacitys)
  const minCapacity = capacitys[nodeNumber - 1];
  console.log('minCapacity', minCapacity, nodeNumber) 
  const maxCapacity = Math.min(...[deviceQuota, minCapacity])
  console.log('maxCapacity', maxCapacity)
  if (checkIfGpuOrNpu(deviceName) === 'GPU') {
    const arr = [0];
    for (let i = 1; i <= maxCapacity && i <= 8; i *= 2) {
      if (i * nodeNumber > deviceQuota) break
      if (i > maxCapacity) break
      arr.push(i);
    }
    return arr;
  }
  if (checkIfGpuOrNpu(deviceName) === 'NPU') {
    if (maxCapacity >= 8) {
      return [8];
    }
    return [];
    
  }
  return [];
}; 