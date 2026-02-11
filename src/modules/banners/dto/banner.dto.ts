export class CreateBannerDto {
  image: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class UpdateBannerDto {
  image?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  sortOrder?: number;
  isActive?: boolean;
}

