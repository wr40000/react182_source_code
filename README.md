

进入while循环中的一定是无孩子的fiber,或者是孩子已经全部完成而返回的父fiber,那么当返回到这个父fiber的时候，这个父fiber也一定也完成了，之后就是找这个父fiber的兄弟



先构建fiber树，completeUnitOfWork(unitOfWork)会创建unitOfWork.stateNode

```js
// finishedWork就是新构建的fiber,双渲染技术中最新的那个
const finishedWork = root.current.alternate;
```

h1的fiber的flag是2,因为其父fiber.current存在，所以创建h1 fiber的时候走的是
```js
workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
// 而 
const reconcileChildFibers = createChildReconciler(true);
```
但是其子节点因为h1的fiber.current不存在，所以flag都是0

注册两阶段的回调