import type { FC } from '../../../lib/teact/teact';
import React from '../../../lib/teact/teact';

// import type { OwnProps } from './GiftModal';

import { Bundles } from '../../../util/moduleLoader';

import useModuleLoader from '../../../hooks/useModuleLoader';


const LuckMoneyModalAsync: FC<any> = (props) => {
  const { modal } = props;

  const LuckMoneyModal = useModuleLoader(Bundles.Stars, 'LuckMoneyModal', !modal);
  const LuckMoneyDetailModal = useModuleLoader(Bundles.Stars, 'LuckMoneyDetailModal', !modal);

  // eslint-disable-next-line react/jsx-props-no-spreading
  if(modal?.type === 'default'){
    return LuckMoneyModal ? <LuckMoneyModal {...props} /> : undefined;

  }else if(modal?.type === 'detail'){
    return LuckMoneyDetailModal ? <LuckMoneyDetailModal {...props} /> : undefined;
  }else{
    return undefined
  }
};

export default LuckMoneyModalAsync;
