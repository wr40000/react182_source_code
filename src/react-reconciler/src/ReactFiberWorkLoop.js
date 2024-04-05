import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
// import { completeWork } from "./ReactFiberCompleteWork";
let workInProgress = null;
export function scheduleUpdateOnFiber(root) {
  ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}
function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);
}
function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null);
  console.log("workInProgress: ", workInProgress);
}
function renderRootSync(root) {
  prepareFreshStack(root);
  workLoopSync();
}
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork); //beginWork 返回的是VirDOM的第一个孩子
  console.log("begin 输出: ", next);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // completeUnitOfWork(unitOfWork);
    workInProgress = null;
  } else {
    workInProgress = next;
  }
}
function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    completeWork(current, completedWork);
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}
