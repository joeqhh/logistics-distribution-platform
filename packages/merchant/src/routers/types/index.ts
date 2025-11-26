import type { RouteObject } from "react-router-dom";
import React from 'react';

export interface MetaProps {
	keepAlive?: boolean;
	requiresAuth?: boolean;
	title: string;
	key?: string;
}

export type CustomRouteObject = Omit<RouteObject, 'children'> & {
	children?: CustomRouteObject[];
	meta?: MetaProps;
}
