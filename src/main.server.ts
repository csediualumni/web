import { mergeApplicationConfig } from '@angular/core';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { serverConfig } from './app/app.config.server';

const serverAppConfig = mergeApplicationConfig(appConfig, serverConfig);

const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, serverAppConfig, context);

export default bootstrap;
