import { RouterTypes } from 'umi';
import { MenuDataItem } from '@ant-design/pro-layout';

import { VCStateType } from "./vc";
import { CommonStateType } from './common';

export interface UserStateType {
  currentUser: {
    userName: string,
    id?: number,
    permissionList: string[],
    nickName?: string,
    phone?: string,
    email?: string,
    currentVC: string[],
  },
}

export interface ConnectState {
  vc: VCStateType;
  common: CommonStateType;
  user: UserStateType;
}

export interface Route extends MenuDataItem {
  routes?: Route[];
}

export interface ConnectProps<T = {}> extends Partial<RouterTypes<Route, T>> {
  dispatch?: Dispatch<AnyAction>;
}