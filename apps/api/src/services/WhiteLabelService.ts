import { PrismaClient, WhitelabelConfig } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

export interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  logoUrl?: string;
  logoDarkUrl?: string;
  logoSquareUrl?: string;
  faviconUrl?: string;
  customDomain?: string;
  customDomainVerified: boolean;
  emailFromName: string;
  emailFromEmail?: string;
  emailLogoUrl?: string;
  emailFooter?: string;
  customCSS?: string;
  customJS?: string;
  productName: string;
  companyName?: string;
  tagline?: string;
  hideWatermark: boolean;
  customFonts?: Record<string, any>;
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl: number;
}

export class WhiteLabelService {
  /**
   * Get branding configuration for an organization
   */
  async getBrandingConfig(organizationId: string): Promise<BrandingConfig | null> {
    const config = await prisma.whitelabelConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      return null;
    }

    return this.mapToConfig(config);
  }

  /**
   * Get branding configuration by custom domain
   */
  async getBrandingByDomain(domain: string): Promise<BrandingConfig | null> {
    const config = await prisma.whitelabelConfig.findFirst({
      where: {
        customDomain: domain,
        customDomainVerified: true,
      },
    });

    if (!config) {
      return null;
    }

    return this.mapToConfig(config);
  }

  /**
   * Create or update branding configuration
   */
  async updateBrandingConfig(
    organizationId: string,
    data: Partial<BrandingConfig>
  ): Promise<BrandingConfig> {
    // Validate colors
    if (data.primaryColor) this.validateColor(data.primaryColor);
    if (data.secondaryColor) this.validateColor(data.secondaryColor);
    if (data.accentColor) this.validateColor(data.accentColor);
    if (data.backgroundColor) this.validateColor(data.backgroundColor);
    if (data.textColor) this.validateColor(data.textColor);

    // Check if config exists
    const existing = await prisma.whitelabelConfig.findUnique({
      where: { organizationId },
    });

    const configData = {
      organizationId,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      logoUrl: data.logoUrl,
      logoDarkUrl: data.logoDarkUrl,
      logoSquareUrl: data.logoSquareUrl,
      faviconUrl: data.faviconUrl,
      emailFromName: data.emailFromName,
      emailFromEmail: data.emailFromEmail,
      emailLogoUrl: data.emailLogoUrl,
      emailFooter: data.emailFooter,
      customCSS: data.customCSS,
      customJS: data.customJS,
      productName: data.productName,
      companyName: data.companyName,
      tagline: data.tagline,
      hideWatermark: data.hideWatermark,
      customFonts: data.customFonts as any,
    };

    // Remove undefined values
    Object.keys(configData).forEach((key) => {
      if (configData[key as keyof typeof configData] === undefined) {
        delete configData[key as keyof typeof configData];
      }
    });

    if (existing) {
      const updated = await prisma.whitelabelConfig.update({
        where: { organizationId },
        data: configData,
      });
      return this.mapToConfig(updated);
    } else {
      const created = await prisma.whitelabelConfig.create({
        data: {
          organizationId,
          ...configData,
        },
      });
      return this.mapToConfig(created);
    }
  }

  /**
   * Configure custom domain
   */
  async configureCustomDomain(
    organizationId: string,
    customDomain: string
  ): Promise<{ config: BrandingConfig; dnsRecords: DNSRecord[] }> {
    // Validate domain format
    if (!this.isValidDomain(customDomain)) {
      throw new Error('Invalid domain format');
    }

    // Check if domain is already in use
    const existingDomain = await prisma.whitelabelConfig.findFirst({
      where: {
        customDomain,
        organizationId: { not: organizationId },
      },
    });

    if (existingDomain) {
      throw new Error('Domain already in use by another organization');
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Generate DNS records for verification
    const dnsRecords: DNSRecord[] = [
      {
        type: 'CNAME',
        name: customDomain,
        value: 'app.nebula-ai.com',
        ttl: 3600,
      },
      {
        type: 'TXT',
        name: `_nebula-verify.${customDomain}`,
        value: verificationToken,
        ttl: 3600,
      },
    ];

    // Update or create config with DNS records
    const config = await prisma.whitelabelConfig.upsert({
      where: { organizationId },
      create: {
        organizationId,
        customDomain,
        customDomainVerified: false,
        customDomainDNS: dnsRecords as any,
      },
      update: {
        customDomain,
        customDomainVerified: false,
        customDomainDNS: dnsRecords as any,
      },
    });

    return {
      config: this.mapToConfig(config),
      dnsRecords,
    };
  }

  /**
   * Verify custom domain DNS configuration
   */
  async verifyCustomDomain(organizationId: string): Promise<boolean> {
    const config = await prisma.whitelabelConfig.findUnique({
      where: { organizationId },
    });

    if (!config || !config.customDomain) {
      throw new Error('No custom domain configured');
    }

    // In production, verify DNS records via DNS lookup
    // For now, mark as verified
    await prisma.whitelabelConfig.update({
      where: { organizationId },
      data: {
        customDomainVerified: true,
      },
    });

    return true;
  }

  /**
   * Upload logo
   */
  async uploadLogo(
    organizationId: string,
    logoType: 'logo' | 'logoDark' | 'logoSquare' | 'favicon',
    fileUrl: string
  ): Promise<BrandingConfig> {
    const updateData: any = {};

    switch (logoType) {
      case 'logo':
        updateData.logoUrl = fileUrl;
        break;
      case 'logoDark':
        updateData.logoDarkUrl = fileUrl;
        break;
      case 'logoSquare':
        updateData.logoSquareUrl = fileUrl;
        break;
      case 'favicon':
        updateData.faviconUrl = fileUrl;
        break;
    }

    const config = await prisma.whitelabelConfig.upsert({
      where: { organizationId },
      create: {
        organizationId,
        ...updateData,
      },
      update: updateData,
    });

    return this.mapToConfig(config);
  }

  /**
   * Get CSS variables for theming
   */
  getCSSVariables(config: BrandingConfig): Record<string, string> {
    return {
      '--color-primary': config.primaryColor,
      '--color-secondary': config.secondaryColor,
      '--color-accent': config.accentColor,
      '--color-background': config.backgroundColor,
      '--color-text': config.textColor,
    };
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrast(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const [rs, gs, bs] = [r, g, b].map((c) => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Validate color hex format
   */
  private validateColor(color: string): void {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexColorRegex.test(color)) {
      throw new Error(`Invalid color format: ${color}`);
    }
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
    return domainRegex.test(domain);
  }

  /**
   * Map database model to config interface
   */
  private mapToConfig(config: WhitelabelConfig): BrandingConfig {
    return {
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      accentColor: config.accentColor,
      backgroundColor: config.backgroundColor,
      textColor: config.textColor,
      logoUrl: config.logoUrl || undefined,
      logoDarkUrl: config.logoDarkUrl || undefined,
      logoSquareUrl: config.logoSquareUrl || undefined,
      faviconUrl: config.faviconUrl || undefined,
      customDomain: config.customDomain || undefined,
      customDomainVerified: config.customDomainVerified,
      emailFromName: config.emailFromName,
      emailFromEmail: config.emailFromEmail || undefined,
      emailLogoUrl: config.emailLogoUrl || undefined,
      emailFooter: config.emailFooter || undefined,
      customCSS: config.customCSS || undefined,
      customJS: config.customJS || undefined,
      productName: config.productName,
      companyName: config.companyName || undefined,
      tagline: config.tagline || undefined,
      hideWatermark: config.hideWatermark,
      customFonts: config.customFonts as any,
    };
  }

  /**
   * Delete branding configuration
   */
  async deleteBrandingConfig(organizationId: string): Promise<void> {
    await prisma.whitelabelConfig.delete({
      where: { organizationId },
    });
  }

  /**
   * Reset to default branding
   */
  async resetToDefaults(organizationId: string): Promise<BrandingConfig> {
    const config = await prisma.whitelabelConfig.upsert({
      where: { organizationId },
      create: {
        organizationId,
      },
      update: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#8B5CF6',
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        logoUrl: null,
        logoDarkUrl: null,
        logoSquareUrl: null,
        faviconUrl: null,
        customCSS: null,
        customJS: null,
        productName: 'Nebula AI',
        emailFromName: 'Nebula AI',
        hideWatermark: false,
      },
    });

    return this.mapToConfig(config);
  }
}

export const whiteLabelService = new WhiteLabelService();
