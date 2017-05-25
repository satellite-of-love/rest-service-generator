import * as CommonHandlers from "@atomist/rugs/operations/CommonHandlers";

export const failer = new CommonHandlers.GenericErrorHandler();
export const hooray = new CommonHandlers.GenericSuccessHandler();
