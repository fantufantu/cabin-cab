# 出行计划向导共享 Header/Footer 设计

## 意图

将出行计划创建流程中的 header 和 footer 外壳从 districts、period、attractions 页面移到 `TouristPlanningLayout`，使步骤切换时外壳组件保持挂载，减少重复创建，同时保留每一步自己的按钮行为。

## 目标与边界

- Layout 持有唯一的 header/footer 外壳和内容容器；各步骤页通过 React portal 渲染标题、副标题和按钮。
- 当前步骤的 Progress 由共享 header 渲染，layout 根据当前子路由提供步骤号；header 文案由对应页面声明。
- 步骤顺序、路由、文案、进度标签和下一步关系集中在一份 flow 配置中。
- 页面切换时 header/footer 外壳不卸载，页面主体仍通过 Outlet 正常切换。
- 不改变向导状态、业务流程、按钮交互、样式和路由结构。

## 方案

- **采用：Layout 固定渲染共享外壳，通过向导上下文传递 header/footer 内容容器 DOM 节点，页面用 `createPortal` 渲染步骤内容。** 页面保有标题、步骤号和按钮状态，layout 只负责容器生命周期与公共外壳。
- 把所有步骤按钮和业务状态都移入 Layout：会让 Layout 承担页面专属逻辑，扩大重构范围，与“按钮仍由页面定义”的意图不符。
- 只抽 header、footer 外壳仍留在页面：不能满足两个外壳都跨步骤保留的目标。

## 实现说明

扩展 header/footer 外壳组件支持接收内容容器 ref。Layout 将两个容器节点保存在向导上下文中，并在共享 header 内渲染带步骤参数的 `Progress`；子页面拿到节点后用 `createPortal` 渲染标题、副标题与 footer 按钮，页面卸载时 portal 自动清理。三个页面移除 header/footer 外壳包装，内容区保持现有结构与行为。

## 验收

- districts、period、attractions 页面切换后，header/footer 外壳仍是同一挂载实例。
- header 标题、说明、进度随步骤正确更新。
- 各步骤原有按钮及其禁用状态、导航和提交行为保持一致。
- 切换步骤或离开向导时 portal 内容随子页面卸载自动清理。
