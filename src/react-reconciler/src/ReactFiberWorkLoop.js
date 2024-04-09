import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from "./ReactWorkTags";
import {
  MutationMask,
  NoFlags,
  Update,
  Placement,
  ChildDeletion,
} from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "./ReactFiberCommitWork";
let workInProgress = null;
export function scheduleUpdateOnFiber(root) {
  ensureRootIsScheduled(root);
}
function ensureRootIsScheduled(root) {
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}
function performConcurrentWorkOnRoot(root) {
  renderRootSync(root);
  const finishedWork = root.current.alternate;
  printFiber(finishedWork);
  console.log(
    `~~~~~~~~~~~~~~~~~~~~~~~~~~~~commitRoot~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`
  );
  console.log("root: ", root);
  root.finishedWork = finishedWork;
  commitRoot(root);
}
function commitRoot(root) {
  const { finishedWork } = root;
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  if (subtreeHasEffects || rootHasEffect) {
    console.log("commitRoot");
    commitMutationEffectsOnFiber(finishedWork, root);
  }
  root.current = finishedWork;
}
function printFiber(fiber) {
  /*
    fiber.flags &= ~Forked;
    fiber.flags &= ~PlacementDEV;
    fiber.flags &= ~Snapshot;
    fiber.flags &= ~PerformedWork;
    */
  if (fiber.flags !== 0) {
    console.log(
      getFlags(fiber.flags),
      getTag(fiber.tag),
      typeof fiber.type === "function" ? fiber.type.name : fiber.type,
      fiber.memoizedProps
    );
    if (fiber.deletions) {
      for (let i = 0; i < fiber.deletions.length; i++) {
        const childToDelete = fiber.deletions[i];
        console.log(
          getTag(childToDelete.tag),
          childToDelete.type,
          childToDelete.memoizedProps
        );
      }
    }
  }
  let child = fiber.child;
  while (child) {
    printFiber(child);
    child = child.sibling;
  }
}
function getTag(tag) {
  switch (tag) {
    case FunctionComponent:
      return `FunctionComponent`;
    case HostRoot:
      return `HostRoot`;
    case HostComponent:
      return `HostComponent`;
    case HostText:
      return HostText;
    default:
      return tag;
  }
}
function getFlags(flags) {
  if (flags === (Update | Placement | ChildDeletion)) {
    return `自己移动和子元素有删除`;
  }
  if (flags === (ChildDeletion | Update)) {
    return `自己有更新和子元素有删除`;
  }
  if (flags === ChildDeletion) {
    return `子元素有删除`;
  }
  if (flags === (Placement | Update)) {
    return `移动并更新`;
  }
  if (flags === Placement) {
    return `插入`;
  }
  if (flags === Update) {
    return `更新`;
  }
  return flags;
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
  // + unitOfWork 如果是文本fiber，beginWork()返回null,
  // + unitOfWork 如果typeof child 是str 或者 number ，也return null
  //   也就是说直接执行completeUnitOfWork(unitOfWork)
  const next = beginWork(current, unitOfWork); //beginWork 返回的是VirDOM的第一个孩子
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    debugger; // 完成工作单元，初渲染该创建真实DOM了
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next; // 递归处理child
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
