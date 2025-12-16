import { mintLicenseOnCronos } from './storyService';
import { Address } from 'viem';

export interface LicenseRequest {
  ipTokenId: number;
  commercialUse: boolean;
  derivativeWorks: boolean;
  exclusive: boolean;
  revenueShare: number;
  duration: number;
  terms: string;
  ipAssetManagerV2Address: Address;
}

export const mintLicense = async (licenseRequest: LicenseRequest) => {
  try {
      const { txHash, blockNumber, explorerUrl } = await mintLicenseOnCronos(
      licenseRequest.ipTokenId,
      licenseRequest.commercialUse,
      licenseRequest.derivativeWorks,
      licenseRequest.exclusive,
      licenseRequest.revenueShare,
      licenseRequest.duration,
      licenseRequest.terms,
      licenseRequest.ipAssetManagerV2Address
    );

    return {
      success: true,
      txHash,
      blockNumber,
      explorerUrl,
      message: 'License minted successfully on Cronos'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to mint license on Cronos'
    };
  }
}; 