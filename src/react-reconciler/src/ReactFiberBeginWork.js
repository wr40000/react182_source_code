import { HostRoot, HostComponent, HostText , IndeterminateComponent,
   FunctionComponent,} from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import logger, { indent } from "shared/logger";
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";
function reconcileChildren(current, workInProgress, nextChildren) {
  if (current === null) {
    // mountChildFibers reconcileChildFibers返回的都是第一个孩子
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}
function updateHostRoot(current, workInProgress) {
  processUpdateQueue(workInProgress); // 更新workInProgress.memoizedState
  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element; // VirDOM
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress;
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}
function mountIndeterminateComponent(_current, workInProgress, Component) {
    const props = workInProgress.pendingProps;
    const value = renderWithHooks(null, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, value);
    return workInProgress.child;
  }

// 构建子fiber 根据是否有current区分是否有副作用，初次渲染，根节点容器已经有了current
// 所以是有副作用的，但是其下的所有虚拟DOM都是无副作用的
export function beginWork(current, workInProgress) {
  indent.number = 2;
  // logger(" ".repeat(indent.number)  "beginWork", workInProgress);
  switch (workInProgress.tag) {
       case IndeterminateComponent: {
           return mountIndeterminateComponent(
             current,
             workInProgress,
             workInProgress.type
           );
         }
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
    default:
      return null;
  }
}