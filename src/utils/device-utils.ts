import { checkIfGpuOrNpu } from "@/models/resource";

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
  if (checkIfGpuOrNpu(deviceName) === 'GPU') {
    const arr = [0];
    for (let i = 1; i <= deviceQuota && i <= 8; i *= 2) {
      if (i * nodeNumber > deviceQuota) break
      arr.push(i);
    }
    return arr;
  }
  if (checkIfGpuOrNpu(deviceName) === 'NPU') {
    if (deviceQuota >= 8) {
      return [8];
    } 
    return [];
    
  }
  return [];
}; 