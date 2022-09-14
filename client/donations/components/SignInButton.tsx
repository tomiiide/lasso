import { MbButton } from 'mintbase-ui';
import { useWallet } from '../services/providers/WalletProvider';

export function SignInButton(): JSX.Element {
  const { signIn } = useWallet();

  return (
    <div className="mt-4">
      <MbButton className="bg-black hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded" onClick={signIn} label="Connect NEAR Wallet" />
    </div>
  );
}
