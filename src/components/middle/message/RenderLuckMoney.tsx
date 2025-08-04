import React, { memo,useEffect,useState } from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';
import useOldLang from '../../../hooks/useOldLang';
import { createPortal } from 'react-dom';

import type {
  ApiMessage, ApiPeer, ApiTypeStory, ApiUser,
} from '../../../api/types';
import './RenderLuckMoney.scss';

interface OwnProps {
  message: ApiMessage;
}

interface StateProps {
  story?: ApiTypeStory;
  peer?: ApiPeer;
  targetUser?: ApiUser;
  isUnread?: boolean;
}


export default function RenderLuckMoney({
  message
}: OwnProps & StateProps) {
  const {openLuckMoneyModal} = getActions()
  const [isEffective,setIsEffective] = useState(true)
  const [loading,isLoading] = useState(false);
  const [msg,setMsg] = useState('');
  const oldLang = useOldLang();
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    
    getStatus()
  },[])
 
  const origin = message.content.text?.text
 
  const originArr = origin?.split('💜')
  const xieyi = originArr[2]
  const title = originArr[3]
  const name = originArr[4]
  const code = originArr[5]

  const getStatus = async ()=>{
    const params = {
      redCode : code,
      channel: message.chatId
    }

    const token = localStorage.getItem('tgToken')
    if(!token){
      return
    }
    

    // const queryString = new URLSearchParams(params).toString()
    fetch('https://xchatviewapi.33test.com/userinfo/checkRedEnvelopeByUser',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify(params),

     })
     .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // 将响应转换为 JSON
    })
    .then( async data => {
      if(data.code === 200){
        if(data.data.status == 1){
          setIsEffective(true)
        }else{
          setIsEffective(false)
        }

      }
     
      console.log('Response data:', data); // 处理响应数据
    })
    .catch(error => {

      console.error('Fetch error:', error); // 错误处理
      

    });
  }

    
  
  const handleReceiveClick = async ()=>{
    const token = localStorage.getItem('tgToken');
    if(!token){
      alert('无token信息')
      return
    }
    const params = {
      redCode : code,
      channel: message.chatId
    }
    

    if(isEffective){
      fetch('https://xchatviewapi.33test.com/userinfo/receiveRedEnvelope',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(params),
  
       })
       .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 将响应转换为 JSON
      })
      .then( async data => {
        console.log(data)
        if(data.code === 200){
         
        //  alert(data.data.msg)
     
          // 领取成功,调取详情接口
          openLuckMoneyModal({
            type : 'detail',
            redCode : code
          })

      
         await getStatus()
         
  
        }else{
          // setMsg(data.msg);
          // setOpen(true);
        }
       
        console.log('Response data:', data); // 处理响应数据
      })
      .catch(error => {
  
        console.error('Fetch error:', error); // 错误处理
        
  
      });


    }else{
      openLuckMoneyModal({
        type : 'detail',
        redCode : code
      })
    }
  }


  return (
    <div className='luckMoney-main'>
      <div
        onClick={handleReceiveClick}
        className={`luckMoney-container ${!isEffective?'luckMoney-disabled':''}`}
      >
        <div className='luckMoney-title'>
          {`${title}`}
        </div>
        <div className='luckMoney-action'>
          {
            isEffective?'领取红包':'已失效'
          }
        </div>
        <div className='luckMoney-footer'>
          
          {`来自${name}的USDT(BEP20)红包`}
        </div>
      </div>
    </div>
  );
}

