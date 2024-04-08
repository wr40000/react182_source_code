import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";
import logger, { indent } from "shared/logger";
function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.subtreeFlags |= subtreeFlags;
}

function appendAllChildren(parent, workInProgress) {
  // 我们只有创建的顶级fiber，但需要递归其子节点来查找所有终端节点
  let node = workInProgress.child;
  while (node !== null) {
    // 如果是原生节点，直接添加到父节点上
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
      // 再看看第一个节节点是不是原生节点
    } else if (node.child !== null) {
      // node.child.return = node
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    // 如果没有弟弟就找父亲的弟弟
    while (node.sibling === null) {
      // 如果找到了根节点或者回到了原节点结束
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    // node.sibling.return = node.return
    // 下一个弟弟节点
    node = node.sibling;
  }
}

// 这里会根据fiber的type创建对应的stateNode,也就是真实DOM元素
export function completeWork(current, workInProgress) {
  indent.number -= 2;
  // logger(" ".repeat(indent.number) + "completeWork", workInProgress);
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostComponent: {
      const { type } = workInProgress;
      const instance = createInstance(type, newProps, workInProgress);
      // + appendAllChildren 会将workInProgress上的child对应的fiber,不断向下查找，
      //   插到instance上
      appendAllChildren(instance, workInProgress);
      workInProgress.stateNode = instance;
      // finalizeInitialChildren 会将节点的children，style等属性赋给instance
      // 这些属性来自virDOM,对于children只处理number,str,react节点已经在
      finalizeInitialChildren(instance, type, newProps);
      bubbleProperties(workInProgress);
      break;
    }
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostText: {
      const newText = newProps;
      // 创建stateNode --真实DOM
      workInProgress.stateNode = createTextInstance(newText);
      bubbleProperties(workInProgress);
      break;
    }
    default:
      break;
  }
}
