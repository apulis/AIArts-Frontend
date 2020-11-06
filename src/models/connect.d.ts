import { RouterTypes } from 'umi';
import { MenuDataItem } from '@ant-design/pro-layout';

import { VCStateType } from "./vc";
import { CommonStateType } from './common';


export interface ConnectState {
  vc: VCStateType;
  common: CommonStateType;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}

export interface ConnectProps<T = {}> extends Partial<RouterTypes<Route, T>> {
  dispatch?: Dispatch<AnyAction>;
}