import { MbButton } from 'mintbase-ui';
import { useWallet } from '../services/providers/WalletProvider';

function Header(): JSX.Element {
  const {
    isConnected, details, signIn, signOut,
  } = useWallet();

  const buttonLabel = isConnected
    ? `Sign Out ${details.accountId}`
    : ' Connect NEAR Wallet';

  const buttonAction = isConnected ? signOut : signIn;

  return (
    <nav className="navbar bg-black flex justify-between w-full sticky top-0 z-40 lg:border-b border-solid border-gray-150">
      <div className="px-4 navbar-start flex justify-between items-center">
        <h1 className="font-bold text-2xl uppercase p-2 sm:p-4 text-white">
          lasso
        </h1>
      </div>
      <h1 className="justify-center text-center font-medium text-2xl p-2 sm:p-4 text-white">
          round up for change
        </h1>
      {/** login/logout with wallet */}
      <div className="text-white flex items-center sm:mr-2">
        <MbButton className="button-85" onClick={buttonAction} label={buttonLabel} />
      </div>
    </nav>
  );
}

export default Header;
