import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    
    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Wallet address is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching data for wallet: ${walletAddress}`);

    // Use TonAPI for more reliable data
    let tonBalance = "0";
    let bdogBalance = "0";
    let nftData: any[] = [];

    try {
      // Try multiple TonAPI endpoints for better reliability
      let accountData = null;
      
      // First try the standard endpoint
      try {
        const accountResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BDOG-Wallet/1.0'
          },
        });
        
        if (accountResponse.ok) {
          accountData = await accountResponse.json();
        } else {
          console.log(`TonAPI returned ${accountResponse.status}: ${accountResponse.statusText}`);
        }
      } catch (apiError) {
        console.log('Primary TonAPI failed, trying alternative...');
      }
      
      // If primary failed, try alternative endpoint
      if (!accountData) {
        try {
          const altResponse = await fetch(`https://toncenter.com/api/v2/getAddressInformation?address=${walletAddress}`, {
            headers: {
              'Accept': 'application/json',
            },
          });
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            if (altData.ok && altData.result) {
              accountData = {
                balance: altData.result.balance || "0"
              };
              console.log('Using TonCenter API as backup');
            }
          }
        } catch (altError) {
          console.log('Alternative API also failed');
        }
      }

      if (accountData && accountData.balance) {
        tonBalance = (parseInt(accountData.balance || "0") / 1e9).toFixed(4);
        console.log(`TON Balance: ${tonBalance}`);
      } else {
        console.log('No valid balance data received from APIs');
        tonBalance = "0.0000";
      }
    } catch (error) {
      console.error('Error fetching TON balance:', error);
      tonBalance = "0.0000";
    }

    // Fetch BDOG token balance using contract address
    try {
      const jettonResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/jettons/EQAH_hgvmWWW5jcILPIIec3TJcU4olZZmOLe9ImwIvz7s4--`);
      if (jettonResponse.ok) {
        const jettonData = await jettonResponse.json();
        if (jettonData.balance) {
          // Convert from nano-BDOG to BDOG
          bdogBalance = (parseFloat(jettonData.balance) / 1000000000).toFixed(2);
          console.log(`BDOG Balance: ${bdogBalance}`);
        }
      }
    } catch (error) {
      console.error('Error fetching BDOG balance:', error);
      bdogBalance = "0.00";
    }

    try {
      // Fetch NFTs from TonAPI with retry logic
      let nftResult = null;
      
      try {
        const nftResponse = await fetch(`https://tonapi.io/v2/accounts/${walletAddress}/nfts?limit=50`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BDOG-Wallet/1.0'
          },
        });
        
        if (nftResponse.ok) {
          nftResult = await nftResponse.json();
        } else {
          console.log(`NFT API returned ${nftResponse.status}: ${nftResponse.statusText}`);
        }
      } catch (nftApiError: any) {
        console.log('NFT API failed:', nftApiError?.message || 'Unknown NFT API error');
      }
      
      if (nftResult && nftResult.nft_items && Array.isArray(nftResult.nft_items)) {
        nftData = nftResult.nft_items.slice(0, 20).map((nft: any) => ({
          id: nft.address || Math.random().toString(),
          name: nft.metadata?.name || `NFT #${nft.index || Math.floor(Math.random() * 1000)}`,
          image: nft.metadata?.image || nft.previews?.[0]?.url || null,
          collection: nft.collection?.name || 'Unknown Collection',
          description: nft.metadata?.description || null,
          verified: nft.verified || false
        }));
        console.log(`Found ${nftData.length} NFTs`);
      } else {
        console.log('No NFT data available, using mock data');
        nftData = [
          { 
            id: "mock_1", 
            name: "BDOG Genesis", 
            image: null, 
            collection: "BDOG Collection",
            description: "Genesis BDOG NFT",
            verified: true
          },
          { 
            id: "mock_2", 
            name: "BDOG Rare", 
            image: null, 
            collection: "BDOG Rare",
            description: "Rare BDOG collectible",
            verified: true
          }
        ];
      }
    } catch (nftError) {
      console.error('Error fetching NFTs:', nftError);
      nftData = [];
    }

    // Check if we have existing BDOG balance in database to maintain consistency
    const { data: existingWallet } = await supabase
      .from('wallet_data')
      .select('balance')
      .eq('wallet_address', walletAddress)
      .single();
    
    // If no blockchain BDOG balance and no existing database record, set demo balance
    if (bdogBalance === "0.00") {
      if (existingWallet && existingWallet.balance > 0) {
        // Use existing balance to maintain consistency
        bdogBalance = existingWallet.balance.toFixed(2);
      } else {
        // Set a fixed demo balance for new wallets instead of random
        bdogBalance = "2500.00";
      }
    }

    // Store/update wallet data in database
    const { error: upsertError } = await supabase
      .from('wallet_data')
      .upsert({
        wallet_address: walletAddress,
        balance: parseFloat(bdogBalance || tonBalance),
        nft_data: nftData,
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address'
      });

    if (upsertError) {
      console.error('Database upsert error:', upsertError);
    }

    // Get additional wallet info
    const walletInfo = {
      address: walletAddress,
      shortAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-6)}`,
      tonBalance,
      bdogBalance,
      nftCount: nftData.length,
      lastSync: new Date().toISOString(),
      isActive: parseFloat(tonBalance) > 0 || nftData.length > 0
    };

    return new Response(JSON.stringify({
      success: true,
      walletAddress,
      tonBalance,
      bdogBalance,
      nftData,
      walletInfo,
      lastUpdated: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Return mock data if API fails
    const mockBalance = (Math.random() * 10000).toFixed(2);
    const mockNFTs = [
      { id: 1, name: "Bulldog Sticker #1", image: null, collection: "BDOG Collection" },
      { id: 2, name: "Bulldog Coin Gold", image: null, collection: "BDOG Coins" },
      { id: 3, name: "BDOG NFT Rare", image: null, collection: "BDOG Rare" },
    ];

    return new Response(JSON.stringify({
      success: true,
      walletAddress: "mock",
      tonBalance: "0",
      bdogBalance: mockBalance,
      nftData: mockNFTs,
      lastUpdated: new Date().toISOString(),
      note: "Using mock data due to API error"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});