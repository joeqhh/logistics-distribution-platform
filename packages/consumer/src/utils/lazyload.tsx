import React from 'react';
import loadable from '@loadable/component';
import { Spin } from '@arco-design/web-react';
// import styles from '../style/layout.module.less';

// https://github.com/gregberge/loadable-components/pull/226
function load(fn: any, options: any) {
  const Component = loadable(fn, options);

  Component.preload = fn?.requireAsync || fn;

  return Component;
}

function LoadingComponent(props: {
  error: boolean;
  timedOut: boolean;
  pastDelay: boolean;
}) {
  if (props.error) {


    console.error(props.error);
    return null;
  }
  return <>  
    <div >
      <Spin />
    </div>
  </>
  
}

export default function withLoader(loader: any) {
  return load(loader, {
    fallback: <LoadingComponent pastDelay={false} error={false} timedOut={false} />,
  });
}

// export default (loader: any) =>
//   load(loader, {
//     fallback: LoadingComponent({
//       pastDelay: true,
//       error: false,
//       timedOut: false,
//     }),
//   });
// import React, { Suspense } from "react";
// import { Spin } from '@arco-design/web-react';
// /**
//  * @description 路由懒加载
//  * @param {Element} Comp 需要访问的组件
//  * @returns element
//  */
// const lazyLoad = (Comp: React.LazyExoticComponent<any>): React.ReactNode => {
// 	return (
// 		<Suspense
// 			fallback={
// 				<Spin
// 					style={{
// 						display: "flex",
// 						alignItems: "center",
// 						justifyContent: "center",
// 						height: "100%"
// 					}}
// 				/>
// 			}
// 		>
// 			<Comp />
// 		</Suspense>
// 	);
// };

// export default lazyLoad;
