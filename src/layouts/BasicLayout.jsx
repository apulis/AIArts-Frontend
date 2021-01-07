/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import { Link, useIntl, connect } from 'umi';
import { Result, Button } from 'antd';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getRouteAuthority } from '@/utils/utils';
import logo from '../assets/logo.svg';
import CommonLayout from './CommonLayout';
import { formatMessage } from 'umi';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle={formatMessage({ id: '403.tips.error' })}
    extra={<p>{formatMessage({ id: '403.tips.concat' })}</p>}
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList, enableAvisuals) =>
  menuList.map((item) => {
    if (item.enableKey === 'AVISUALIS') {
      if (enableAvisuals === false) {
        return null;
      }
    }
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children, enableAvisuals) : [],
    };
    return Authorized.check(item.authority, localItem, null);
  });

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
    collapsed,
    user,
  } = props;
  const { currentVC } = user.currentUser;
  /**
   * constructor
   */

  /**
   * init variables
   */

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority
  const authorized = getRouteAuthority(location.pathname || '/', props.route.routes) || '';
  const { formatMessage } = useIntl();
  useEffect(() => {
    if (!props.common.platformName) return;
    dispatch({
      type: 'settings/changeSetting',
      payload: {
        ...settings,
        title: props.common.platformName,
      },
    });
  }, [props.common]);

  const getVCDetail = () => {
    if (currentVC?.length > 0) {
      if (!localStorage.vc || !currentVC.includes(localStorage.vc)) {
        dispatch({
          type: 'vc/userSelectVC',
          payload: {
            vcName: currentVC[0],
          },
        });
      } else if (localStorage.vc) {
        dispatch({
          type: 'vc/userSelectVC',
          payload: {
            vcName: localStorage.vc,
          },
        });
      }
    }
  }
  useEffect(() => {
    getVCDetail();
  }, [location, user])
  return (
    <>
      <ProLayout
        logo={logo}
        formatMessage={formatMessage}
        menuHeaderRender={(logoDom, titleDom) => (
          <Link to="/">
            {/* {logoDom} */}
            {titleDom}
          </Link>
        )}
        onCollapse={handleMenuCollapse}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || menuItemProps.children || !menuItemProps.path) {
            return defaultDom;
          }
          if (menuItemProps.target === '_blank') {
            return (
              <a href={menuItemProps.path} target="_blank">
                {defaultDom}
              </a>
            );
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: formatMessage({
              id: 'menu.home',
            }),
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        // footerRender={() => defaultFooterDom}
        menuDataRender={(menuData) => menuDataRender(menuData, props.common.enableAvisuals)}
        rightContentRender={() => <RightContent />}
        {...props}
        {...settings}
      >
        <Authorized authority={authorized} noMatch={noMatch}>
          <CommonLayout>{children}</CommonLayout>
        </Authorized>
      </ProLayout>
      {/* <SettingDrawer
        settings={settings}
        onSettingChange={config =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      /> */}
    </>
  );
};

export default connect(({ global, settings, common, user }) => ({
  collapsed: global.collapsed,
  settings,
  common,
  user
}))(BasicLayout);
