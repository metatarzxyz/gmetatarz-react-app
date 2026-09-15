import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './index.css';
import {
  useAccount,
  useSignMessage,
  useSendTransaction,
  useBalance,
  useReadContract,
  useChainId,
} from 'wagmi';
import { parseEther, formatEther, formatUnits, erc20Abi, isAddress } from 'viem';

// ---------------------------------------------------------------------------
// TypeScript 4.9 workaround: wagmi v2/v3 ships types that use variadic tuple
// and conditional-type features TS 4.9 cannot parse, which makes the compiler
// think hooks take zero args. We erase those generics by re-typing the hooks
// as simple, permissive function signatures. Runtime behavior is unchanged.
// ---------------------------------------------------------------------------
type AnyHook = (config?: any) => any;

const useReadContractLoose = useReadContract as unknown as AnyHook;
const useBalanceLoose = useBalance as unknown as AnyHook;
const useSendTransactionLoose = useSendTransaction as unknown as AnyHook;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { data: hash, sendTransactionAsync, isPending: isTxPending } =
    useSendTransactionLoose() as {
      data: `0x${string}` | undefined;
      sendTransactionAsync: (args: { to: `0x${string}`; value: bigint }) => Promise<`0x${string}`>;
      isPending: boolean;
    };

  const [txTo, setTxTo] = useState('');
  const [txAmount, setTxAmount] = useState('0.001');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenAddressInput, setTokenAddressInput] = useState('');

  const [signature, setSignature] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const showToast = (kind: 'ok' | 'err', text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 4000);
  };

  // Native balance
  const {
    data: nativeBalance,
    refetch: refetchNativeBalance,
    isLoading: isNativeLoading,
  } = useBalanceLoose({
    address,
    query: { enabled: !!address },
  }) as {
    data: { value: bigint; symbol: string } | undefined;
    refetch: () => void;
    isLoading: boolean;
  };

  // ERC20 balance
  const {
    data: tokenBalance,
    refetch: refetchTokenBalance,
    isLoading: isTokenLoading,
    error: tokenError,
  } = useReadContractLoose({
    abi: erc20Abi,
    address: tokenAddress && isAddress(tokenAddress) ? tokenAddress : undefined,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenAddress && isAddress(tokenAddress) },
  }) as {
    data: bigint | undefined;
    refetch: () => void;
    isLoading: boolean;
    error: unknown;
  };

  const { data: tokenSymbol } = useReadContractLoose({
    abi: erc20Abi,
    address: tokenAddress && isAddress(tokenAddress) ? tokenAddress : undefined,
    functionName: 'symbol',
    query: { enabled: !!tokenAddress && isAddress(tokenAddress) },
  }) as { data: string | undefined };

  const { data: tokenDecimals } = useReadContractLoose({
    abi: erc20Abi,
    address: tokenAddress && isAddress(tokenAddress) ? tokenAddress : undefined,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress && isAddress(tokenAddress) },
  }) as { data: number | undefined };

  const handleSignMsg = async () => {
    if (!isConnected) return showToast('err', 'Connect your wallet first');
    try {
      const message = 'gMetatarz';
      const sig = await signMessageAsync({ message });
      setSignature(sig);
      showToast('ok', 'Message signed successfully');
    } catch (e) {
      console.error(e);
      showToast('err', 'Failed to sign message');
    }
  };

  const handleSendTx = async () => {
    if (!isConnected) return showToast('err', 'Connect your wallet first');
    if (!txTo || !isAddress(txTo)) return showToast('err', 'Enter a valid recipient address');
    if (!txAmount || Number(txAmount) <= 0) return showToast('err', 'Enter a valid amount');

    try {
      const txHash = await sendTransactionAsync({
        to: txTo as `0x${string}`,
        value: parseEther(txAmount),
      });
      showToast('ok', 'Transaction sent');
      refetchNativeBalance();
      console.log('tx hash', txHash);
    } catch (e) {
      console.error(e);
      showToast('err', 'Failed to send transaction');
    }
  };

  const handleLoadToken = () => {
    if (!isAddress(tokenAddressInput)) return showToast('err', 'Invalid ERC20 address');
    setTokenAddress(tokenAddressInput);
  };

  return (
    <div className="home">
      <div className="background-image" />
      <div className="overlay" />

      {toast && (
        <div className={`toast ${toast.kind}`}>
          <span>{toast.text}</span>
        </div>
      )}

      <div className="wallet-shell">
        <header className="wallet-header">
          <div className="brand">
            <span className="brand-dot" />
            <span className="brand-text">gMetatarz Wallet</span>
          </div>
          <ConnectButton showBalance={false} />

        </header>

        {!isConnected ? (
          <div className="empty-state">
            <div className="empty-glow" />
            <h2>Connect your wallet</h2>
            <p>Sign messages, send transactions, and view balances across chains.</p>
          </div>
        ) : (
          <div className="wallet-grid">
            <section className="panel panel-wide">
              <div className="panel-head">
                <h3>Wallet</h3>
                <span className="chip">Chain {chainId}</span>
              </div>
              <div className="address-row">
                <code className="address">{address}</code>
                <button
                  className="ghost-button"
                  onClick={() => {
                    navigator.clipboard.writeText(address ?? '');
                    showToast('ok', 'Address copied');
                  }}
                >
                  Copy
                </button>
              </div>
              <div className="balance-hero">
                <span className="balance-label">Native Balance</span>
                {isNativeLoading ? (
                  <span className="skeleton" />
                ) : (
                  <span className="balance-amount">
                    {nativeBalance ? formatEther(nativeBalance.value) : '0'}{' '}
                    <span className="balance-symbol">{nativeBalance?.symbol ?? ''}</span>
                  </span>
                )}
                <button className="ghost-button" onClick={() => refetchNativeBalance()}>
                  Refresh
                </button>
              </div>
            </section>

            <section className="panel">
              <div className="panel-head">
                <h3>Sign Message</h3>
              </div>
              <p className="muted">Prove ownership of your wallet by signing a message.</p>
              <button className="primary-button" onClick={handleSignMsg}>
                Sign "gMetatarz"
              </button>
              {signature && (
                <div className="result-block">
                  <span className="result-label">Signature</span>
                  <code className="result-value">{signature.slice(0, 40)}…</code>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <h3>Send Native</h3>
              </div>
              <label className="field">
                <span>Recipient</span>
                <input
                  placeholder="0x…"
                  value={txTo}
                  onChange={(e) => setTxTo(e.target.value)}
                />
              </label>
              <label className="field">
                <span>Amount</span>
                <input
                  placeholder="0.001"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                />
              </label>
              <button className="primary-button" onClick={handleSendTx} disabled={isTxPending}>
                {isTxPending ? 'Sending…' : 'Send'}
              </button>
              {hash && (
                <div className="result-block">
                  <span className="result-label">Last tx</span>
                  <code className="result-value">
                    {hash.slice(0, 10)}…{hash.slice(-8)}
                  </code>
                </div>
              )}
            </section>

            <section className="panel panel-wide">
              <div className="panel-head">
                <h3>ERC20 Balance</h3>
              </div>
              <div className="inline-form">
                <input
                  placeholder="ERC20 contract address (0x…)"
                  value={tokenAddressInput}
                  onChange={(e) => setTokenAddressInput(e.target.value)}
                />
                <button className="ghost-button" onClick={handleLoadToken}>
                  Load
                </button>
              </div>

              {tokenAddress && (
                <div className="token-card">
                  <div className="token-meta">
                    <span className="token-symbol">{tokenSymbol ?? 'TOKEN'}</span>
                    <span className="token-addr">
                      {tokenAddress.slice(0, 6)}…{tokenAddress.slice(-4)}
                    </span>
                  </div>
                  {isTokenLoading ? (
                    <span className="skeleton" />
                  ) : tokenError ? (
                    <span className="error-text">Failed to load balance</span>
                  ) : tokenBalance !== undefined && tokenDecimals !== undefined ? (
                    <span className="token-balance">
                      {formatUnits(tokenBalance, tokenDecimals)}
                    </span>
                  ) : (
                    <span className="muted">No data</span>
                  )}
                  <button className="ghost-button" onClick={() => refetchTokenBalance()}>
                    Refresh
                  </button>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;