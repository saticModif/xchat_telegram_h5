import type { FC } from "../../../lib/teact/teact";
import React, {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "../../../lib/teact/teact";
import { getActions, withGlobal, getGlobal } from "../../../global";

import type {
  ApiPremiumGiftCodeOption,
  ApiStarGift,
  ApiUser,
} from "../../../api/types";
import type { StarGiftCategory, TabState } from "../../../global/types";

import { getUserFullName } from "../../../global/helpers";
import { selectUser } from "../../../global/selectors";
import buildClassName from "../../../util/buildClassName";

import useCurrentOrPrev from "../../../hooks/useCurrentOrPrev";
import useLang from "../../../hooks/useLang";
import useLastCallback from "../../../hooks/useLastCallback";
import useOldLang from "../../../hooks/useOldLang";

import Avatar from "../../common/Avatar";
import SafeLink from "../../common/SafeLink";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import Transition from "../../ui/Transition";
import BalanceBlock from "../stars/BalanceBlock";

import styles from "./GiftModal.module.scss";

import StarsBackground from "../../../assets/stars-bg.png";
import InputText from "../../ui/InputText";
import UsernameInput from "../../common/UsernameInput";
import CountryCodeInput from "../../auth/CountryCodeInput";
import MessageInput from "../../middle/composer/MessageInput";

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

const PremiumGiftModal: FC<OwnProps & StateProps> = ({ modal = undefined }) => {
  const { closeLuckMoneyModal, requestConfetti, sendMessage } = getActions();
  // eslint-disable-next-line no-null/no-null
  const dialogRef = useRef<HTMLDivElement>(null);

  const [isHeaderHidden, setIsHeaderHidden] = useState(true);
  const isOpen = Boolean(modal);
  const renderingModal = useCurrentOrPrev(modal);

  const [detail, setDeail] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const oldLang = useOldLang();
  const lang = useLang();
  const global = getGlobal();

  console.log(detail)
  console.log('32132')

  const showConfetti = useLastCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      const { top, left, width, height } = dialog
        .querySelector(".modal-content")!
        .getBoundingClientRect();
      requestConfetti({
        top,
        left,
        width,
        height,
        withStars: true,
      });
    }
  });

  const getReceiveLuckMoneyDetail = async () => {
    const token = localStorage.getItem("tgToken");

    if (!token) {
      alert("无token信息");
      return;
    }
    const params = {
      redCode: modal.redCode,
    };
    fetch("https://xchatviewapi.33test.com/userinfo/getRedEnvelopeInfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(params),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json(); // 将响应转换为 JSON
      })
      .then(async (data) => {
        console.log(data);
        if (data.code === 200) {
          setDeail(data.data);
        }

        console.log("Response data:", data); // 处理响应数据
      })
      .catch((error) => {
        console.error("Fetch error:", error); // 错误处理
      });
  };

  useEffect(() => {
    if (renderingModal?.isCompleted) {
      showConfetti();
    }
  }, [renderingModal]);

  useEffect(() => {
    if (!isOpen) {
      setIsHeaderHidden(true);
    } else {
      getReceiveLuckMoneyDetail();
    }
  }, [isOpen]);
  const handleCloseButtonClick = useLastCallback(() => {
    closeLuckMoneyModal();
  });

  const buttonClassName = buildClassName("animated-close-icon");

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
        ariaLabel={oldLang("Common.Close")}
      >
        <div className={buttonClassName} />
      </Button>
      <div className={styles.title}>
        {`${detail?.sendUserInfo?.nick ?? "-"}的红包`}
      </div>
      <div className={styles.detailContainer}>
        <div className={styles.detailDescription}>
          {`${detail?.description ?? "-"}`}
        </div>
        <div className={styles.bigAmount}>
          <span className={styles.amount}>
            {`${detail?.amount.toFixed(2) || '0.00'}`}
          </span>
          <span className={styles.unit}>
            {`${detail?.chatTokenInfo?.tokenSymbol ?? ''}`}
          </span>
        </div>
      </div>
      
        <div className={styles.tip}>
          <span>已领取</span>
          <span className={styles.tip_red}>{`${detail?.redList?.length || 0}/${detail?.numTotal}`}</span>
          <span>个红包，共</span>
          <span className={styles.tip_red}>{`${(detail?.amount - detail?.surplusAmount).toFixed(2)}/${detail?.amount?.toFixed(2)}`}</span>
          <span >元</span>

        </div>
        {
          detail?.redList?.map((r:any,k:number)=>(
        <div className={styles.redListItem} key={r.id}>
          <div className={styles.redListItem_left}>
            <span className={styles.redListItemImg}></span>
            <span className={styles.redListItem_info}>
              <div  className={styles.redListItem_name}>
                {r?.xchatUser?.nick}
              </div>
              <div className={styles.redListItem_time}>
                {
                  r?.createTime?.slice(5,16)
                }
              </div>
            </span>
          </div>
          <div className={styles.redListItem_right}>
            {
              `
                ${r?.amount?.toFixed(2) || ''}
                ${detail?.chatTokenInfo?.tokenSymbol ?? ''}
              `
            }
          </div>
        </div>
            
          ))
        }
    </Modal>
  );
};

export default memo(
  withGlobal<OwnProps>((global, { modal }): StateProps => {
    const { starGiftsById, starGiftCategoriesByName, stars } = global;

    const user = modal?.forUserId
      ? selectUser(global, modal.forUserId)
      : undefined;

    return {
      boostPerSentGift: global.appConfig?.boostsPerSentGift,
      starGiftsById,
      starGiftCategoriesByName,
      starBalance: stars?.balance,
      user,
    };
  })(PremiumGiftModal)
);
