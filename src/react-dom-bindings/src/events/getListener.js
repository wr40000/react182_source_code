import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

export default function getListener(inst, registrationName) {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName];
  return listener;
}