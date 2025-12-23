import discordIcon from '../../assets/icons/discord.png';
import githubIcon from '../../assets/icons/github.png';
import telegramIcon from '../../assets/icons/telegram.png';
import vkIcon from '../../assets/icons/vk.png';

export const SOCIAL_ICONS = {
    discord: discordIcon,
    github: githubIcon,
    telegram: telegramIcon,
    vk: vkIcon,
} as const;

export interface SocialLink {
    name: string;
    url: string;
    icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: 'Telegram',
        url: 'https://t.me/electronstx',
        icon: SOCIAL_ICONS.telegram,
    },
    {
        name: 'VK',
        url: 'https://vk.com/electronstx',
        icon: SOCIAL_ICONS.vk,
    },
    {
        name: 'GitHub',
        url: 'https://github.com/electronstx',
        icon: SOCIAL_ICONS.github,
    },
    {
        name: 'Discord',
        url: 'https://discord.gg/electronstx',
        icon: SOCIAL_ICONS.discord,
    },
];
