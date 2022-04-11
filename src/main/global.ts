export var pids = [];
export var diskIds = [];
export var guestFsQueue = [];
export const delFromDiskIds = (disk: string) => {
  diskIds = diskIds.filter((item) => item !== disk);
};

export const pushGuestFsQueue = (element: string) => {
  guestFsQueue.push(element);
};

export const shiftGuestFsQueue = () => {
  return guestFsQueue.shift();
};
