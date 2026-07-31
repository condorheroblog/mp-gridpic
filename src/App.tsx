/**
 * App 顶层 - 仅作为 RouterProvider 出口
 * 真正路由分发由 ./router 完成。
 */
import { RouterProvider } from "react-router-dom";

import { router } from "./router";

export default function App() {
	return <RouterProvider router={router} />;
}
