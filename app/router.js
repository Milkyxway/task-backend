"use strict";

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
	const { router, controller } = app;
	router.get("/", controller.home.index);

	/**
	 * 任务列表增删改查
	 */
	router.post("/api/task/list", controller.task.query);
	router.post("/api/task/add", controller.task.add);
	router.delete("/api/task/delete", controller.task.delete);
	router.put("/api/task/update", controller.task.update);
};
