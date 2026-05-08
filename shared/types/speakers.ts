export interface Speaker {
  id: number;
  name: string;
  photo: string | null;
  bio: string | null;
  socialLinks: string | null;
  createdAt?: Date | null;
}

export interface CreateSpeakerDto {
  name: string;
  photo?: string;
  bio?: string;
  socialLinks?: string;
}