import type { FC } from '../../../lib/teact/teact';
import React, {
  memo, useEffect, useMemo, useRef, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal,getGlobal } from '../../../global';

import type {
  ApiPremiumGiftCodeOption,
  ApiStarGift,
  ApiUser,
} from '../../../api/types';
import type { StarGiftCategory, TabState } from '../../../global/types';

import { getUserFullName } from '../../../global/helpers';
import { selectUser } from '../../../global/selectors';
import buildClassName from '../../../util/buildClassName';

import useCurrentOrPrev from '../../../hooks/useCurrentOrPrev';
import useLang from '../../../hooks/useLang';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';

import Avatar from '../../common/Avatar';
import SafeLink from '../../common/SafeLink';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import Transition from '../../ui/Transition';
import BalanceBlock from '../stars/BalanceBlock';

import styles from './GiftModal.module.scss';

import StarsBackground from '../../../assets/stars-bg.png';
import InputText from '../../ui/InputText';
import UsernameInput from '../../common/UsernameInput';
import CountryCodeInput from '../../auth/CountryCodeInput';
import MessageInput from '../../middle/composer/MessageInput';

export type OwnProps = {
  modal: any;
};

export type GiftOption = ApiPremiumGiftCodeOption | ApiStarGift;

type StateProps = {
  boostPerSentGift?: number;
  starGiftsById?: Record<string, ApiStarGift>;
  starGiftCategoriesByName: Record<StarGiftCategory, string[]>;
  starBalance?: number;
  user?: ApiUser;
};

type chatType = 'chatTypeBasicGroup' | 'chatTypePrivate'
const PremiumGiftModal: FC<OwnProps & StateProps> = ({
  modal = undefined,

 
}) => {
  const {
    closeLuckMoneyModal, requestConfetti,sendMessage
  } = getActions();
  // eslint-disable-next-line no-null/no-null
  const dialogRef = useRef<HTMLDivElement>(null);

  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);

  const [money,setMoney] = useState(undefined)
  const [num,setNum] = useState();
  const [availableBalance,setAvailableBalance] = useState(0);
  const [description,setDescription] = useState('大吉大利 恭喜发财');
  const [isLoading,setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [msg,setMsg] = useState('')

  const oldLang = useOldLang();
  const lang = useLang();
  const global = getGlobal()
  
  const chatType:chatType = modal?.chat?.type


  const showConfetti = useLastCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const {
        top, left, width, height,
      } = dialog.querySelector('.modal-content')!.getBoundingClientRect();
      requestConfetti({
        top,
        left,
        width,
        height,
        withStars: true,
      });
    }
  });

  const fetchData = async () => {
    const token = localStorage.getItem('tgToken');
   
    if(!token){
     alert('用户没有有效的token信息') 
     return
    }
    const apiUrl = 'https://xchatviewapi.33test.com/userinfo/getToken'; 
  
    try {
      const response = await fetch(apiUrl, {
        method: 'GET', // 如果接口要求其他请求方法，比如 POST，请更改此处
        headers: {
          'Authorization': `${token}`, // 使用 Bearer 方式传递 Token
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        // 处理非 2xx 响应
        const errorInfo = await response.json();
        console.error('Failed to fetch user info:', errorInfo);
        throw new Error(`HTTP Error: ${response.status}`);
      }
  
      const data = await response.json(); // 解析响应数据
      if(data.code ===200){
        const amount = data.data.List.find(item => item.tokenSymbol === 'USDT')?.userToken?.amount;
        setAvailableBalance(amount);
      }
      console.log('data:', data.data);
      return data; // 返回用户信息
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error; // 将错误抛出以便外部捕获
    }
  };
  useEffect(() => {fetchData()}, []);

  const handleSubmit = async(e)=>{
    e.stopPropagation()

    const token = localStorage.getItem('tgToken');
    console.log('token',token)
    console.log('money',money)
    console.log('num',num)
    console.log('description',description)
    if(token){
      const params = {
        amount : money,
        appointTelegram : modal?.forUserId,
        type : chatType==='chatTypeBasicGroup'?1:2,
        tokenId : 3,
        num:chatType!=='chatTypeBasicGroup'?1:num,
        description:description
      }
   
     
      setIsLoading(true)
      fetch('https://xchatviewapi.33test.com/userinfo/senRedEnvelope',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(params),
  
       })
       .then(response => {
        console.log(response+'>>>>>>>>>>>>>>>>');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 将响应转换为 JSON
      })
      .then( async data => {
        console.log('321')
        console.log(data)
        if(data.code === 200){
          
          const redCode = data.data.redCode;

          const message = {
            messageList : {
              chatId : modal.forUserId,
              threadId : modal.threadId,
              type : 'thread'
            },
            text : redCode,
            isSilent:false,
            shouldUpdateStickerSetOrder:true,
          }
      
          sendMessage(message)
          handleCloseButtonClick()
        }else{
          // alert(data.msg)
          if(money==undefined){
            setMsg('请输入金额');
            setIsVisible(true);
          }else{
            setMsg(data.msg);
            setIsVisible(true);
          }
        }
        setIsLoading(false)
        

        
        // console.log('Response data:', data); // 处理响应数据
      })
      .catch(error => {
        console.error('Fetch error:', error); // 错误处理
        setIsLoading(false)
      });
      

    }
  }
  useEffect(() => {
    if (renderingModal?.isCompleted) {
      showConfetti();
    }
  }, [renderingModal]);

  useEffect(() => {
    if (!isOpen) {
      setIsHeaderHidden(true);

    }
  }, [isOpen]);
  const handleCloseButtonClick = useLastCallback(() => {

    closeLuckMoneyModal();
  });




  const buttonClassName = buildClassName(
    'animated-close-icon',
  );

  return (
    <Modal
      dialogRef={dialogRef}
      onClose={closeLuckMoneyModal}
      isOpen={isOpen}
      isSlim
      contentClassName={styles.content}
      className={buildClassName(styles.modalDialog, styles.root)}
    >
      <Button
        className={styles.closeButton}
        round
        color="translucent"
        size="smaller"
        onClick={handleCloseButtonClick}
        ariaLabel={ oldLang('Common.Close')}
      >
        <div className={buttonClassName} />
      </Button>

      <div className={styles.title}>发红包</div>
      <div className={styles.itemContainer}>
        <div >币种</div>
        <div className={styles.currencyVal}>USDT(BFP20)</div>
      </div>
      {
        
        <div className={styles.itemContainer}>
        <div className={styles.itemContainerName}>祝福语</div>
        <div className={styles.inputDesctriptionContent}>
          <input 
            value={description} 
            className={styles.inputDesctription}
         
            onChange={(e)=>{
              setDescription(e.target.value)
            }}
          ></input>
        </div>
      </div>
      }
      {/* <div className={styles.eedEnvelopeSwitching}>
        <div className={styles.luckyRedPacket}>手气红包</div>
        <div className={styles.ordinaryRedEnvelope}>改为普通红包</div>
      </div> */}
      <div className={styles.itemContainer}>
        <div className={styles.itemContainerName}>总金额</div>
        <div>
          <input 
            value={money} 
            className={styles.inputDesctription}
            placeholder='请输入金额'
            onChange={(e)=>{
              setMoney(e.target.value)
            }}
          ></input>
        </div>
      </div>
        <div className={styles.eedEnvelopeSwitching}>
          <div className={styles.availableBalance}>可用金额：</div>
          <div className={styles.quantity}>{availableBalance}</div>
          <div className={styles.luckyRedPacket}>USDT(BFP20)</div>
        </div>
      {
        chatType === 'chatTypeBasicGroup' &&
        <div className={styles.itemContainer}>
          <div className={styles.itemContainerName}>红包个数</div>
        <div>
          <input 
            value={num} 
            className={styles.inputDesctription}
            placeholder='请输入个数'
            onChange={(e)=>{
              setNum(+e.target.value)
            }}
          ></input>
        </div>
      </div>
      }
      {
        //  chatType === 'chatTypeBasicGroup' &&<div className={styles.numberPeople}>本群共有<span className={styles.quantity}>4</span>人</div>
      }

      <Button
        isLoading={isLoading}
        className={styles.luckMoneySubmitBtn}
        color="primary"
        onClick={handleSubmit}
        
      >
        <div>塞币进红包</div>
      </Button>

      {isVisible && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupBox}>
            <p className={styles.popupName}>{msg}</p>
            <button className={styles.hintBtn} onClick={() => setIsVisible(false)}>确定</button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default memo(withGlobal<OwnProps>((global, { modal }): StateProps => {
  const { starGiftsById, starGiftCategoriesByName, stars } = global;

  const user = modal?.forUserId ? selectUser(global, modal.forUserId) : undefined;

  return {
    boostPerSentGift: global.appConfig?.boostsPerSentGift,
    starGiftsById,
    starGiftCategoriesByName,
    starBalance: stars?.balance,
    user,
  };
})(PremiumGiftModal));

