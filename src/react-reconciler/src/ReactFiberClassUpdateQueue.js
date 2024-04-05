import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";
import assign from "shared/assign"

export const UpdateState = 0;
export function initializeUpdateQueue(fiber) {
  const queue = {
    shared: {
      pending: null,
    },
  };
  fiber.updateQueue = queue;
}

export function createUpdate() {
  // 标记
  const update = { tag: UpdateState };
  return update;
}
export function enqueueUpdate(fiber, update) {
  const updateQueue = fiber.updateQueue;
  const sharedQueue = updateQueue.shared;
  const pending = sharedQueue.pending; //pending指向尾节点
  if (pending === null) {
    update.next = update;
  } else {
    // 单向循环链表，链表尾部(pending)的next指向表头
    // 此时的pending.next指向为头节点，因为新update需要作为新的为节点，
    // 该操作使新update指向头节点
    update.next = pending.next;
    pending.next = update; // 旧队尾指向新的队尾节点，也就是新update
  }
  updateQueue.shared.pending = update; // 更正pending指向
  return markUpdateLaneFromFiberToRoot(fiber);
}

function getStateFromUpdate(update, prevState) {
  switch (update.tag) {
    case UpdateState: {
      const { payload } = update;
      const partialState = payload;
      return assign({}, prevState, partialState);
    }
    default:
      return prevState;
  }
}
export function processUpdateQueue(workInProgress) {
  const queue = workInProgress.updateQueue;
  const pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    let newState = workInProgress.memoizedState;
    let update = firstPendingUpdate;
    while (update) {
      newState = getStateFromUpdate(update, newState);
      update = update.next;
    }
    workInProgress.memoizedState = newState;
  }
}
