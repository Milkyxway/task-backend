"use strict";

const { Controller } = require("egg");

class ReportController extends Controller {
	async index() {
		const { ctx } = this;
		ctx.body = "hi, egg";
	}

	async getReportList() {
		const { ctx, service } = this;
		try {
			const result = await service.report.getReportList(ctx.request.body);
			return ctx.sendSuccess(result);
		} catch (e) {
			return ctx.sendError(e);
		}
	}
}

module.exports = ReportController;
