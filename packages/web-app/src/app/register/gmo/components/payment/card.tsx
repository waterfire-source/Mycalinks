// Card.tsx
import { useState } from 'react';
import { Button } from '@mui/material';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useElements,
  useMultiPayment,
} from '@mul-pay/mptoken-react-js';
import { MultiPaymentEventType } from '@mul-pay/mptoken-js';

const styleObject = {
  style: {
    base: {
      fontSize: '12px',
      color: '#32325d',
      fontSmoothing: 'antialiased',
      padding: '12px',
      '::placeholder': {
        color: '#aab7c4',
        fontSize: '12px',
      },
    },
  },
  // オートコンプリートを有効にする
  autocomplete: 'cc-number',
};

const styles = `
  .form {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
 
  .form-group {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-top: 1rem;
  }
 
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
    gap: 0.5rem;
  }
 
  .label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0rem;
  }
 
  .input-wrapper {
    width: 100%;
    margin-top: 0.25rem;
  }
 
  .input-field {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background-color: white;
    box-sizing: border-box;
  }
 
  .text-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    box-sizing: border-box;
  }
 
  .text-input:focus {
    outline: none;
  }
 
  .error-message {
    width: 100%;
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.375rem;
    background-color: #fef2f2;
    box-sizing: border-box;
  }
 
  .error-text {
    font-size: 0.875rem;
    color: #dc2626;
    word-break: break-all;
  }
`;

export const GmoPaymentCard = ({
  setPaymentToken, //支払いトークンを保持
}: {
  setPaymentToken: (token: string, cardLast4: string) => void;
}) => {
  interface TokenObj {
    result: string;
    maskedCardNumber: string;
    tokenExpiryDate: string;
    isSecurityCodeSet: boolean;
    tokenList: string[];
  }
  const elements = useElements();
  const mulpay = useMultiPayment();
  const [cardHolderName, setCardHolderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cardNumberError, setCardNumberError] = useState<boolean>(false);
  const [expiryError, setExpiryError] = useState<boolean>(false);
  const [cvcError, setCvcError] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!mulpay || !elements) return;
    const cardElement = elements.getElement('cardNumber');
    if (cardElement === null) return;

    setShowErrors(true);
    if (cardNumberError || expiryError || cvcError) return;

    setLoading(true);
    const options = { tokenNumber: '2' };

    mulpay
      .getTokenThroughIframe(cardElement, cardHolderName, options)
      .then((tokenResponse: TokenObj) => {
        if (tokenResponse.result === 'success') {
          setPaymentToken(
            tokenResponse.tokenList[0],
            tokenResponse.maskedCardNumber.slice(-4),
          );
        } else {
          // eslint-disable-next-line no-console
          console.error('トークンの取得に失敗しました。');
        }
      })
      .catch((error: any) => {
        // eslint-disable-next-line no-console
        console.error('Failed to get token:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  interface PaymentEvent {
    elementType: 'cardNumber' | 'cardExpiry' | 'cardCvc';
    invalid?: boolean;
  }

  const logEvent = (name: MultiPaymentEventType) => (event: PaymentEvent) => {
    if (name !== 'change') return;

    const errorHandlers = {
      cardNumber: setCardNumberError,
      cardExpiry: setExpiryError,
      cardCvc: setCvcError,
    };

    const setError = errorHandlers[event.elementType];
    if (setError) {
      setError(event.invalid ?? false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <form
        className="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        autoComplete="on"
      >
        <div className="form-group">
          <label className="label" htmlFor="cardNumber">
            カード番号
          </label>
          <div className="input-wrapper">
            <div className="input-field">
              <CardNumberElement
                id="cardNumber"
                onBlur={logEvent('blur')}
                onChange={logEvent('change')}
                onFocus={logEvent('focus')}
                options={{
                  ...styleObject,
                  autocomplete: 'cc-number',
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="label" htmlFor="expiry">
              有効期限
            </label>
            <div className="input-wrapper">
              <div className="input-field">
                <CardExpiryElement
                  id="expiry"
                  onBlur={logEvent('blur')}
                  onChange={logEvent('change')}
                  onFocus={logEvent('focus')}
                  onReady={logEvent('ready')}
                  options={{
                    ...styleObject,
                    autocomplete: 'cc-exp',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="cvc">
              セキュリティコード
            </label>
            <div className="input-wrapper">
              <div className="input-field">
                <CardCvcElement
                  id="cvc"
                  onBlur={logEvent('blur')}
                  onChange={logEvent('change')}
                  onFocus={logEvent('focus')}
                  onReady={logEvent('ready')}
                  options={{
                    ...styleObject,
                    autocomplete: 'cc-csc',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="label" htmlFor="cardHolderName">
            カード名義
          </label>
          <input
            id="cardHolderName"
            required
            placeholder="TARO YAMADA"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            className="text-input"
            autoComplete="cc-name"
            name="cc-name"
          />
        </div>

        {showErrors && (cardNumberError || expiryError || cvcError) && (
          <div className="error-message">
            <div className="error-text">
              {cardNumberError && (
                <>
                  <span>・カード番号が正しくありません</span>
                  <br />
                </>
              )}
              {expiryError && (
                <>
                  <span>・有効期限が正しくありません</span>
                  <br />
                </>
              )}
              {cvcError && <span>・セキュリティコードが正しくありません</span>}
            </div>
          </div>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={
            !cardHolderName ||
            cardNumberError ||
            expiryError ||
            cvcError ||
            loading
          }
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            padding: '0.875rem 1.5rem',
            marginTop: '15px',
          }}
        >
          {loading ? '処理中...' : 'カードを登録'}
        </Button>
      </form>
    </>
  );
};
