export function addEventCaptureListener(target, eventType, listener) {
    target.addEventListener(eventType, listener, true);
    return listener;
  }
  
  export function addEventBubbleListener(target, eventType, listener) {
    // debugger //绑定事件
    target.addEventListener(eventType, listener, false);
    return listener;
  }