import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Trash2, Copy, Check, Paintbrush, Link as LinkIcon, 
  User, Code, ExternalLink, Image as ImageIcon, Tag, Type, LayoutTemplate, 
  Search, Instagram, Youtube, MessageCircle, Twitter, Facebook, ShoppingBag, 
  Music, Download, Upload, Pin, Settings, GripVertical, FolderOpen, Save, 
  FilePlus, Trash, MoreVertical, AlignLeft, Image as BannerIcon
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type CarouselItem = {
  id: string;
  title: string;
  url: string;
  image: string;
  price?: string;
  rating?: string;
  soldCount?: string;
};

type LinkItem = {
  id: string;
  type?: 'link' | 'text' | 'banner';
  title: string;
  url: string;
  image?: string;
  subtitle?: string;
  badge?: string;
  layout?: 'standard' | 'card' | 'carousel';
  category?: string;
  carouselItems?: CarouselItem[];
  rating?: string;
  soldCount?: string;
  isPinned?: boolean;
  content?: string; // For text block
  textAlign?: 'left' | 'center' | 'right';
};

type Project = {
  id: string;
  name: string;
  profile: Profile;
  links: LinkItem[];
  settings: SettingsData;
  lastModified: number;
};

type SettingsData = {
  googleAnalyticsId: string;
  metaPixelId: string;
  histatsCode: string;
  utmTags: string;
};

const EMOJI_PRESETS = ['🛒', '🔥', '✨', '👗', '👟', '💄', '📱', '💻', '🎁', '👇', '✅', '⭐', '🛍️', '📦'];

const BIO_PRESETS = [
  { label: "General - Spill Barang Viral", value: "Spill barang-barang viral TikTok & Shopee!\n👇 Klik link di bawah buat check out 👇" },
  { label: "General - Racun Belanja", value: "Racun belanja tiap hari 💸\nBarang murah & berkualitas cek di sini 👇" },
  { label: "General - Promo & Diskon", value: "Kumpulan promo & diskon gila-gilaan 💸🔥\nJangan sampai kehabisan! 👇" },
  { label: "General - Rekomendasi Pilihan", value: "Semua barang yang aku rekomen ada di sini ✨\nDijamin kualitasnya juara! 👇" },
  { label: "Fashion - Outfit Kece", value: "Racun outfit kece & murah meriah 👗✨\nCek koleksinya di bawah ya! 👇" },
  { label: "Fashion - OOTD Cowok Skena", value: "Inspirasi OOTD Cowok Skena & Casual 👕👟\nLink beli ada di bawah 👇" },
  { label: "Fashion - Hijab Style", value: "Inspirasi Hijab Outfit kekinian 🧕✨\nTampil cantik gak perlu mahal 👇" },
  { label: "Beauty - Skincare & Makeup", value: "Review jujur skincare & makeup 💄✨\nSemua produk yang aku pake ada di sini 👇" },
  { label: "Beauty - Glow Up Bareng", value: "Tips Glow Up & Racun Skincare ✨\nCheckout produknya di sini 👇" },
  { label: "Tech - Gadget Review", value: "Gadget & Tech reviewer 📱💻\nLink pembelian barang review 👇" },
  { label: "Tech - Setup Desk", value: "Inspirasi Setup Meja Kerja & Gaming 🖥️🎮\nSpill barangnya di bawah 👇" },
  { label: "Home - Dekor Kamar", value: "Racun dekorasi kamar aesthetic 🛏️✨\nBikin kamar makin cozy 👇" },
  { label: "Home - Perabotan Unik", value: "Spill perabotan rumah unik & estetik 🏡💡\nKlik link buat beli 👇" },
  { label: "Food - Cemilan Viral", value: "Racun cemilan enak & viral 🍜🤤\nAwas ketagihan! Beli di sini 👇" },
  { label: "Kpop - Merch & Stuff", value: "Spill Kpop Merch & Printilan lucu 🎀✨\nKpopers wajib cek 👇" }
];

const THEME_PRESETS = [
  { name: 'Minimalist Light', bgColor: '#f3f4f6', cardBgColor: '#ffffff', btnColor: '#2563eb', textColor: '#1f2937', cardShadow: 'soft' as const },
  { name: 'Dark Mode', bgColor: '#111827', cardBgColor: '#1f2937', btnColor: '#3b82f6', textColor: '#f3f4f6', cardShadow: 'soft' as const },
  { name: 'Girly Pink', bgColor: '#fdf2f8', cardBgColor: '#ffffff', btnColor: '#ec4899', textColor: '#831843', cardShadow: 'soft' as const },
  { name: 'Earthy Tone', bgColor: '#fefce8', cardBgColor: '#fef3c7', btnColor: '#d97706', textColor: '#78350f', cardShadow: 'none' as const },
  { name: 'Tech Neon', bgColor: '#000000', cardBgColor: '#111111', btnColor: '#22c55e', textColor: '#ffffff', cardShadow: 'hard' as const },
];

const FONT_OPTIONS = [
  { label: 'Modern (Inter)', value: "'Inter', sans-serif" },
  { label: 'Elegant (Playfair)', value: "'Playfair Display', serif" },
  { label: 'Playful (Quicksand)', value: "'Quicksand', sans-serif" },
  { label: 'Monospace (JetBrains)', value: "'JetBrains Mono', monospace" }
];

type Profile = {
  name: string;
  bio: string;
  avatarUrl: string;
  bgColor: string;
  btnColor: string;
  textColor: string;
  cardBgColor: string;
  fontFamily: string;
  buttonStyle: 'rounded-none' | 'rounded-xl' | 'rounded-full';
  bgImageUrl: string;
  bgOverlay: 'none' | 'dark' | 'light';
  bgBlur: 'none' | 'sm' | 'md' | 'lg';
  cardShadow: 'none' | 'soft' | 'hard';
  hoverAnimation: 'translate' | 'scale' | 'wiggle' | 'glow';
};

const SortableLinkItem = React.memo(({ link, index, children }: { link: LinkItem, index: number, children: React.ReactNode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 cursor-grab active:cursor-grabbing z-20 opacity-60 group-hover:opacity-100 transition-all"
      >
        <GripVertical size={22} />
      </div>
      {children}
    </div>
  );
});

export default function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'design' | 'settings' | 'projects'>('links');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PROJECT MANAGEMENT ---
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('redi_biolink_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem('redi_biolink_current_project_id');
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // --- LICENSE SYSTEM ---
  const [licenseKey, setLicenseKey] = useState(() => localStorage.getItem('redi_biolink_license_key') || '');
  const [isLicensed, setIsLicensed] = useState(() => localStorage.getItem('redi_biolink_is_licensed') === 'true');
  const [showLicenseModal, setShowLicenseModal] = useState(!isLicensed); // Langsung muncul kalau belum licensed
  const [verifyingLicense, setVerifyingLicense] = useState(false);
  const [licenseError, setLicenseError] = useState('');

  const verifyLicense = async (key: string) => {
    if (!key) {
      setLicenseError('Masukkan license key dulu bro!');
      return;
    }
    
    setVerifyingLicense(true);
    setLicenseError('');
    
    try {
      // Menggunakan URL dari environment variable atau default
      const workerUrl = import.meta.env.VITE_LICENSE_WORKER_URL || 'https://licensebiolink.revolusidigital2024.workers.dev/verify';
      const response = await fetch(`${workerUrl}?key=${key}`);
      
      if (!response.ok) {
        throw new Error('Server error');
      }
      
      const data = await response.json();
      
      if (data.valid) {
        setIsLicensed(true);
        setLicenseKey(key);
        localStorage.setItem('redi_biolink_is_licensed', 'true');
        localStorage.setItem('redi_biolink_license_key', key);
        setShowLicenseModal(false);
        setToastMessage('License Berhasil Diaktivasi! 🚀');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setLicenseError(data.message || 'License Key Tidak Valid! Silakan hubungi admin ReDi.');
      }
    } catch (error) {
      console.error('License check failed:', error);
      setLicenseError('Gagal menghubungi server license. Pastikan koneksi internet aktif.');
    } finally {
      setVerifyingLicense(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('redi_biolink_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('redi_biolink_current_project_id', currentProjectId);
    } else {
      localStorage.removeItem('redi_biolink_current_project_id');
    }
  }, [currentProjectId]);

  const saveCurrentToProject = (name?: string) => {
    const id = currentProjectId || Date.now().toString();
    const projectName = name || projects.find(p => p.id === id)?.name || 'Project Baru';
    
    const newProject: Project = {
      id,
      name: projectName,
      profile,
      links,
      settings,
      lastModified: Date.now()
    };

    setProjects(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.map(p => p.id === id ? newProject : p);
      }
      return [...prev, newProject];
    });
    setCurrentProjectId(id);
    setToastMessage(name ? 'Project baru berhasil dibuat! 💾' : 'Project berhasil diperbarui! 💾');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    // Auto switch to projects tab if it's a new project to show it's saved
    if (name) {
      setActiveTab('projects');
    }
  };

  const loadProject = (project: Project) => {
    setProfile(project.profile);
    setLinks(project.links);
    setSettings(project.settings);
    setCurrentProjectId(project.id);
    setActiveTab('links');
  };

  const deleteProject = (id: string) => {
    if (confirm('Hapus project ini?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (currentProjectId === id) setCurrentProjectId(null);
    }
  };

  const createNewProject = () => {
    if (confirm('Buat project baru? Pastikan project saat ini sudah disimpan.')) {
      setProfile({
        name: 'Racun Affiliate 🛒',
        bio: 'Spill barang-barang viral TikTok & Shopee!\n👇 Klik link di bawah buat check out 👇',
        avatarUrl: '/logo.png',
        bgColor: '#f3f4f6',
        btnColor: '#2563eb',
        textColor: '#1f2937',
        cardBgColor: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        buttonStyle: 'rounded-xl',
        bgImageUrl: '',
        bgOverlay: 'dark',
        bgBlur: 'none',
        cardShadow: 'soft',
        hoverAnimation: 'translate'
      });
      setLinks([
        { id: '1', title: 'Link Baru', url: 'https://', layout: 'standard' }
      ]);
      setSettings({
        googleAnalyticsId: '',
        metaPixelId: '',
        histatsCode: '',
        utmTags: 'utm_source=redi_biolink&utm_medium=biolink'
      });
      setCurrentProjectId(null);
      setActiveTab('profile');
    }
  };

  const [settings, setSettings] = useState<SettingsData>({
    googleAnalyticsId: '',
    metaPixelId: '',
    histatsCode: '',
    utmTags: 'utm_source=redi_biolink&utm_medium=biolink'
  });

  const handleExportData = () => {
    const data = { profile, links, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redi-biolink-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile) setProfile(data.profile);
        if (data.links) setLinks(data.links);
        if (data.settings) setSettings(data.settings);
        alert('Data berhasil di-load! 🎉');
      } catch (error) {
        alert('Format file tidak valid! Pastikan file .json dari ReDi Biolink Generator.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const [profile, setProfile] = useState<Profile>({
    name: 'Racun Affiliate 🛒',
    bio: 'Spill barang-barang viral TikTok & Shopee!\n👇 Klik link di bawah buat check out 👇',
    avatarUrl: '/logo.png',
    bgColor: '#f3f4f6',
    btnColor: '#2563eb',
    textColor: '#1f2937',
    cardBgColor: '#ffffff',
    fontFamily: "'Inter', sans-serif",
    buttonStyle: 'rounded-xl',
    bgImageUrl: '',
    bgOverlay: 'dark',
    bgBlur: 'none',
    cardShadow: 'soft',
    hoverAnimation: 'translate'
  });

  const [links, setLinks] = useState<LinkItem[]>([
    { 
      id: '1', 
      title: 'Skincare Viral TikTok 🧴', 
      subtitle: 'Diskon 50% cuma hari ini!',
      url: 'https://shopee.co.id',
      image: 'https://picsum.photos/seed/skincare/150/150',
      badge: '🔥 HOT',
      layout: 'card',
      category: 'Beauty',
      rating: '4.9',
      soldCount: '10RB+'
    },
    { 
      id: '2', 
      title: 'Katalog Outfit Cowok Skena 👕', 
      url: '#',
      layout: 'carousel',
      category: 'Fashion',
      carouselItems: [
        { id: 'c1', title: 'Kaos Oversize', url: 'https://tokopedia.com', image: 'https://picsum.photos/seed/kaos/150/150', price: 'Rp 59.000', rating: '4.8', soldCount: '2RB+' },
        { id: 'c2', title: 'Celana Cargo', url: 'https://tokopedia.com', image: 'https://picsum.photos/seed/cargo/150/150', price: 'Rp 120.000', rating: '4.9', soldCount: '5RB+' },
        { id: 'c3', title: 'Sepatu Retro', url: 'https://tokopedia.com', image: 'https://picsum.photos/seed/sepatu/150/150', price: 'Rp 250.000', rating: '5.0', soldCount: '1RB+' }
      ]
    },
    { 
      id: '3', 
      title: 'OOTD Nongkrong Skena 👕', 
      url: 'https://lazada.co.id',
      badge: 'Promo',
      layout: 'standard',
      category: 'Fashion'
    },
  ]);

  const categories = ['All', ...Array.from(new Set(links.map(l => l.category).filter(Boolean)))];

  const filteredLinks = links.filter(link => {
    if (link.isPinned) return true;
    const matchesSearch = link.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || link.category === activeCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLinks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUpdateLink = (id: string, field: keyof LinkItem, value: string) => {
    setLinks(links.map((link) => (link.id === id ? { ...link, [field]: value } : link)));
  };

  const handleDeleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleAddLink = (type: 'link' | 'text' | 'banner') => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      type,
      title: type === 'link' ? 'Produk Baru' : '',
      url: type === 'text' ? '' : 'https://',
      layout: 'standard',
      content: type === 'text' ? 'Tulis teks atau informasi di sini...' : '',
      image: type === 'banner' ? 'https://picsum.photos/seed/banner/800/200' : '',
      category: activeCategory !== 'All' ? activeCategory : ''
    };
    setLinks([newLink, ...links]);
  };

  const handleAddCarouselItem = (linkId: string) => {
    setLinks(links.map(link => {
      if (link.id === linkId) {
        const newItems = [...(link.carouselItems || []), { id: Date.now().toString(), title: 'Produk Baru', url: 'https://', image: '' }];
        return { ...link, carouselItems: newItems };
      }
      return link;
    }));
  };

  const handleUpdateCarouselItem = (linkId: string, itemId: string, field: keyof CarouselItem, value: string) => {
    setLinks(links.map(link => {
      if (link.id === linkId && link.carouselItems) {
        const newItems = link.carouselItems.map(item => item.id === itemId ? { ...item, [field]: value } : item);
        return { ...link, carouselItems: newItems };
      }
      return link;
    }));
  };

  const handleDeleteCarouselItem = (linkId: string, itemId: string) => {
    setLinks(links.map(link => {
      if (link.id === linkId && link.carouselItems) {
        const newItems = link.carouselItems.filter(item => item.id !== itemId);
        return { ...link, carouselItems: newItems };
      }
      return link;
    }));
  };

  const escapeXML = (str: string | undefined) => {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const appendUTM = (url: string, utm: string) => {
    if (!utm) return url;
    try {
      const urlObj = new URL(url);
      const utmParams = new URLSearchParams(utm);
      utmParams.forEach((value, key) => {
        urlObj.searchParams.set(key, value);
      });
      return urlObj.toString();
    } catch (e) {
      if (url.includes('?')) return `${url}&${utm}`;
      return `${url}?${utm}`;
    }
  };

  const generateBloggerXML = () => {
    const appendUTMXML = (url: string, utm: string) => {
      if (!utm) return url;
      try {
        const urlObj = new URL(url);
        const utmParams = new URLSearchParams(utm);
        utmParams.forEach((value, key) => {
          urlObj.searchParams.set(key, value);
        });
        return urlObj.toString();
      } catch (e) {
        if (url.includes('?')) return `${url}&${utm}`;
        return `${url}?${utm}`;
      }
    };

    const sortedLinks = [...links]; // Don't sort in editor, use drag order

    const getBorderRadius = () => {
      if (profile.buttonStyle === 'rounded-none') return '0px';
      if (profile.buttonStyle === 'rounded-full') return '9999px';
      return '16px'; // default rounded-xl
    };
    const borderRadius = getBorderRadius();

    const getShadowCSS = () => {
      if (profile.cardShadow === 'none') return 'box-shadow: none; border: 1px solid rgba(0,0,0,0.1);';
      if (profile.cardShadow === 'hard') return 'box-shadow: 4px 4px 0px 0px rgba(0,0,0,1); border: 2px solid #000;';
      return 'box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.05);';
    };

    const getHoverShadowCSS = () => {
      if (profile.cardShadow === 'none') return 'box-shadow: none; border-color: ' + profile.btnColor + ';';
      if (profile.cardShadow === 'hard') return 'box-shadow: 6px 6px 0px 0px rgba(0,0,0,1); transform: translate(-2px, -2px);';
      return 'box-shadow: 0 8px 20px rgba(0,0,0,0.08); border-color: ' + profile.btnColor + ';';
    };

    const getOverlayCSS = () => {
      let css = '';
      if (profile.bgOverlay === 'dark') css += 'background-color: rgba(0,0,0,0.5); ';
      if (profile.bgOverlay === 'light') css += 'background-color: rgba(255,255,255,0.5); ';
      if (profile.bgBlur === 'sm') css += 'backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); ';
      if (profile.bgBlur === 'md') css += 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); ';
      if (profile.bgBlur === 'lg') css += 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); ';
      return css;
    };

    const getHoverAnimCSS = () => {
      if (profile.hoverAnimation === 'scale') return 'transform: scale(1.03);';
      if (profile.hoverAnimation === 'wiggle') return 'animation: wiggle 0.4s ease-in-out infinite;';
      if (profile.hoverAnimation === 'glow') return `box-shadow: 0 0 20px ${profile.btnColor}; transform: translateY(-1px);`;
      return 'transform: translateY(-3px);'; // translate
    };

    const getBgCSS = () => {
      if (!profile.bgImageUrl) return `background-color: ${profile.bgColor};`;
      return `background-color: ${profile.bgColor};
      background-image: url('${profile.bgImageUrl}');
      background-size: cover;
      background-position: center;
      background-attachment: fixed;`;
    };

    const xmlCategories = ['All', ...Array.from(new Set(links.map(l => l.category).filter(Boolean))) as string[]];

    return `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsVersion='3' b:responsive='true' b:templateUrl='vege.xml' b:templateVersion='1.3.0' expr:dir='data:blog.languageDirection' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta content='width=device-width, initial-scale=1, maximum-scale=1' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=JetBrains+Mono:wght@400;500;700&amp;family=Playfair+Display:wght@400;600;700&amp;family=Quicksand:wght@400;600;700&amp;display=swap');
  </style>
  <b:skin><![CDATA[
    /* CSS Reset & Custom Styles */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      ${getBgCSS()}
      color: ${profile.textColor};
      font-family: ${profile.fontFamily.replace(/'/g, '')}, -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
    }
    .bg-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: -1;
      ${getOverlayCSS()}
    }
    @keyframes wiggle {
      0%, 100% { transform: rotate(-3deg); }
      50% { transform: rotate(3deg); }
    }
    .main-section, .widget {
      width: 100%;
      display: flex;
      justify-content: center;
    }
    .bio-container {
      width: 100%;
      max-width: 480px;
      text-align: center;
      padding: 3rem 1.5rem;
      margin: 0 auto;
    }
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 1rem;
      border: 4px solid ${profile.cardBgColor};
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .name {
      font-size: 1.35rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .bio {
      font-size: 0.95rem;
      opacity: 0.85;
      margin-bottom: 2.5rem;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .search-container {
      position: relative;
      width: 100%;
      margin-bottom: 1.5rem;
    }
    .search-icon {
      position: absolute;
      left: 1.2rem;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(0, 0, 0, 0.4);
      width: 18px;
      height: 18px;
      transition: color 0.3s ease;
    }
    .search-container:focus-within .search-icon {
      color: ${profile.btnColor};
    }
    .search-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 2.8rem;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.4);
      background-color: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      font-size: 0.9rem;
      font-weight: 500;
      color: #1f2937;
      outline: none;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      transition: all 0.3s ease;
    }
    .search-input:focus {
      border-color: ${profile.btnColor};
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      background-color: #ffffff;
    }
    .category-tabs {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      margin-bottom: 1.5rem;
      padding-bottom: 0.25rem;
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .category-tabs::-webkit-scrollbar {
      display: none;
    }
    .category-btn {
      flex: 0 0 auto;
      padding: 0.375rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      background-color: rgba(255, 255, 255, 0.2);
      color: ${profile.textColor};
      opacity: 0.7;
    }
    .category-btn:hover {
      opacity: 1;
    }
    .category-btn.active {
      background-color: ${profile.btnColor};
      color: #ffffff;
      opacity: 1;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .links-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    /* Standard Button Link */
    .link-btn {
      display: block;
      width: 100%;
      padding: 1.2rem;
      background-color: ${profile.btnColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: ${borderRadius};
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.2s ease;
      ${getShadowCSS()}
      position: relative;
    }
    .link-btn:hover {
      ${getHoverAnimCSS()}
      ${getHoverShadowCSS()}
      filter: brightness(1.1);
    }

    /* Rich Product Card Link */
    .link-card {
      display: flex;
      align-items: center;
      width: 100%;
      background-color: ${profile.cardBgColor};
      text-decoration: none;
      border-radius: ${borderRadius};
      padding: 0.75rem;
      transition: all 0.2s ease;
      ${getShadowCSS()}
      position: relative;
    }
    .link-card:hover {
      ${getHoverAnimCSS()}
      ${getHoverShadowCSS()}
    }
    .link-card-img {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
    }
    .link-card-content {
      flex: 1;
      text-align: left;
      padding: 0 1rem;
      overflow: hidden;
    }
    .link-card-title {
      font-weight: 700;
      font-size: 0.95rem;
      color: ${profile.textColor};
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .link-card-subtitle {
      font-size: 0.8rem;
      color: ${profile.textColor};
      opacity: 0.7;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .link-card-action {
      background-color: ${profile.btnColor};
      color: #fff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-right: 0.5rem;
    }
    .link-card-action svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* Carousel / Katalog Geser */
    .carousel-container {
      width: 100%;
      margin-bottom: 1rem;
      position: relative;
    }
    .carousel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0 0.25rem;
    }
    .carousel-title {
      font-weight: 700;
      font-size: 1.05rem;
      color: ${profile.textColor};
    }
    .carousel-track {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 1rem;
      scroll-snap-type: x mandatory;
      cursor: grab;
    }
    .carousel-track:active {
      cursor: grabbing;
    }
    /* Custom Scrollbar for PC */
    .carousel-track::-webkit-scrollbar {
      height: 6px;
    }
    .carousel-track::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
    }
    .carousel-track::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 10px;
    }
    .carousel-track::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.25);
    }
    /* Hide scrollbar on touch devices */
    @media (hover: none) and (pointer: coarse) {
      .carousel-track::-webkit-scrollbar {
        display: none;
      }
      .carousel-track {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    }
    .carousel-item {
      flex: 0 0 140px;
      scroll-snap-align: start;
      background-color: ${profile.cardBgColor};
      border-radius: ${borderRadius};
      overflow: hidden;
      ${getShadowCSS()}
      text-decoration: none;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s ease;
    }
    .carousel-item:hover {
      ${getHoverAnimCSS()}
    }
    .carousel-img {
      width: 100%;
      height: 140px;
      object-fit: cover;
      background-color: #f3f4f6;
    }
    .carousel-info {
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .carousel-item-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: ${profile.textColor};
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .carousel-item-price {
      font-size: 0.8rem;
      font-weight: 700;
      color: ${profile.btnColor};
    }
    
    /* Stats: Rating & Sold Count */
    .item-stats {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.7rem;
      margin-top: 0.25rem;
    }
    .item-rating {
      color: #f59e0b;
      font-weight: 700;
      display: flex;
      align-items: center;
    }
    .item-sold {
      color: ${profile.textColor};
      opacity: 0.65;
      font-weight: 500;
    }

    /* FOMO Badge */
    .badge {
      position: absolute;
      top: -10px;
      right: -5px;
      background-color: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
      animation: pulse 2s infinite;
      z-index: 10;
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    .watermark {
      margin-top: 3rem;
      font-size: 0.75rem;
      opacity: 0.6;
      font-weight: 500;
    }
    .watermark a {
      color: inherit;
      text-decoration: none;
    }
    .watermark a:hover {
      text-decoration: underline;
    }
    .pin-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #fbbf24;
      color: #fff;
      padding: 4px;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  ]]></b:skin>
  ${settings.googleAnalyticsId ? `
  <!-- Google tag (gtag.js) -->
  <script async="async" src="https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${settings.googleAnalyticsId}');
  </script>
  ` : ''}
  ${settings.metaPixelId ? `
  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${settings.metaPixelId}');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${settings.metaPixelId}&amp;ev=PageView&amp;noscript=1" /></noscript>
  <!-- End Meta Pixel Code -->
  ` : ''}
</head>
<body>
  <div class="bg-overlay"></div>
  <div class="bio-container">
    <img src="${escapeXML(profile.avatarUrl)}" alt="Avatar" class="avatar" />
          <h1 class="name">${escapeXML(profile.name)}</h1>
          <p class="bio">${escapeXML(profile.bio)}</p>

          <div class="search-container">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="searchInput" class="search-input" placeholder="Cari produk..." />
          </div>

          ${xmlCategories.length > 1 ? `
          <div class="category-tabs" id="categoryTabs">
            ${xmlCategories.map((cat, index) => `
            <button class="category-btn ${index === 0 ? 'active' : ''}" data-category="${escapeXML(cat)}">${escapeXML(cat)}</button>
            `).join('')}
          </div>
          ` : ''}

          <div class="links-wrapper" id="linksWrapper">
            ${sortedLinks.map(l => {
              const badgeHtml = l.badge ? `<div class="badge">${escapeXML(l.badge)}</div>` : '';
              const categoryAttr = l.category ? `data-category="${escapeXML(l.category)}"` : 'data-category=""';
              const titleAttr = `data-title="${escapeXML(l.title).toLowerCase()}"`;
              const pinnedAttr = `data-pinned="${l.isPinned ? 'true' : 'false'}"`;
              const pinBadgeHtml = l.isPinned ? `<div class="pin-badge"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"></line><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.68V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v4.68a2 2 0 0 1-1.11 1.87l-1.78.9A2 2 0 0 0 5 15.24Z"></path></svg></div>` : '';
              const finalUrl = escapeXML(appendUTMXML(l.url, settings.utmTags));
              
              if (l.type === 'text') {
                const fontSize = l.badge === 'small' ? '0.75rem' : l.badge === 'large' ? '1.15rem; font-weight: 700' : '0.9rem';
                const alignment = l.textAlign || 'center';
                return `<div class="link-item-container" style="width: 100%; text-align: ${alignment}; padding: 0.5rem 1rem; opacity: 0.85; font-size: ${fontSize}" ${categoryAttr} ${titleAttr} ${pinnedAttr}>${escapeXML(l.content)}</div>`;
              }

              if (l.type === 'banner') {
                const bannerImg = `<img src="${escapeXML(l.image)}" style="width: 100%; height: auto; display: block; border-radius: ${borderRadius}; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" loading="lazy" />`;
                return l.url ? 
                  `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="link-item-container" style="display: block; width: 100%; transition: transform 0.2s ease;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'" ${categoryAttr} ${titleAttr} ${pinnedAttr}>${bannerImg}</a>` :
                  `<div class="link-item-container" style="width: 100%;" ${categoryAttr} ${titleAttr} ${pinnedAttr}>${bannerImg}</div>`;
              }

              if (l.layout === 'carousel' && l.carouselItems && l.carouselItems.length > 0) {
                return `
            <div class="carousel-container link-item-container" ${categoryAttr} ${titleAttr} ${pinnedAttr}>
              ${pinBadgeHtml}
              <div class="carousel-header">
                <div class="carousel-title">${escapeXML(l.title)}</div>
                ${badgeHtml}
              </div>
              <div class="carousel-track">
                ${l.carouselItems.map(item => `
                <a href="${escapeXML(appendUTMXML(item.url, settings.utmTags))}" target="_blank" rel="noopener noreferrer" class="carousel-item">
                  <img src="${escapeXML(item.image)}" alt="${escapeXML(item.title)}" class="carousel-img" loading="lazy" />
                  <div class="carousel-info">
                    <div class="carousel-item-title">${escapeXML(item.title)}</div>
                    ${item.price ? `<div class="carousel-item-price">${escapeXML(item.price)}</div>` : ''}
                    ${(item.rating || item.soldCount) ? `
                    <div class="item-stats">
                      ${item.rating ? `<div class="item-rating">⭐ ${escapeXML(item.rating)}</div>` : ''}
                      ${item.soldCount ? `<div class="item-sold">${escapeXML(item.soldCount)} Terjual</div>` : ''}
                    </div>
                    ` : ''}
                  </div>
                </a>
                `).join('')}
              </div>
            </div>`;
              } else if (l.layout === 'card' || (!l.layout && (l.image || l.subtitle))) {
                // Render Rich Product Card
                return `
            <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="link-card link-item-container" ${categoryAttr} ${titleAttr} ${pinnedAttr}>
              ${pinBadgeHtml}
              ${badgeHtml}
              ${l.image ? `<img src="${escapeXML(l.image)}" alt="${escapeXML(l.title)}" class="link-card-img"/>` : ''}
              <div class="link-card-content">
                <div class="link-card-title">${escapeXML(l.title)}</div>
                ${l.subtitle ? `<div class="link-card-subtitle">${escapeXML(l.subtitle)}</div>` : ''}
                ${(l.rating || l.soldCount) ? `
                <div class="item-stats">
                  ${l.rating ? `<div class="item-rating">⭐ ${escapeXML(l.rating)}</div>` : ''}
                  ${l.soldCount ? `<div class="item-sold">${escapeXML(l.soldCount)} Terjual</div>` : ''}
                </div>
                ` : ''}
              </div>
              <div class="link-card-action">
                <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </a>`;
              } else {
                // Render Standard Button
                return `
            <a href="${finalUrl}" target="_blank" rel="noopener noreferrer" class="link-btn link-item-container" ${categoryAttr} ${titleAttr} ${pinnedAttr}>
              ${pinBadgeHtml}
              ${badgeHtml}
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <span>${escapeXML(l.title)}</span>
                ${(l.rating || l.soldCount) ? `
                <div class="item-stats" style="justify-content: center; margin-top: 2px; color: #fff; opacity: 0.9;">
                  ${l.rating ? `<div class="item-rating" style="color: #fbbf24;">⭐ ${escapeXML(l.rating)}</div>` : ''}
                  ${l.soldCount ? `<div class="item-sold" style="color: #fff;">${escapeXML(l.soldCount)} Terjual</div>` : ''}
                </div>
                ` : ''}
              </div>
            </a>`;
              }
            }).join('\n            ')}
          </div>
          <div class="watermark">&amp;copy; 2024 - 2026 <a href="https://www.redi.web.id/" target="_blank" rel="noopener noreferrer">ReDi (Revolusi Digital)</a></div>
  </div>

  <!-- Dummy section required by Blogger to validate the template -->
  <b:section id='dummy' showaddelement='false'/>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Drag-to-scroll functionality for PC users
      const tracks = document.querySelectorAll('.carousel-track');
      tracks.forEach(track => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let isDragging = false;

        track.addEventListener('mousedown', (e) => {
          isDown = true;
          isDragging = false;
          startX = e.pageX - track.offsetLeft;
          scrollLeft = track.scrollLeft;
          track.style.scrollSnapType = 'none';
        });

        track.addEventListener('mouseleave', () => {
          isDown = false;
          track.style.scrollSnapType = 'x mandatory';
        });

        track.addEventListener('mouseup', () => {
          isDown = false;
          track.style.scrollSnapType = 'x mandatory';
        });

        track.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          isDragging = true;
          const x = e.pageX - track.offsetLeft;
          const walk = (x - startX) * 2; // Scroll speed
          track.scrollLeft = scrollLeft - walk;
        });

        // Prevent accidental link clicks while dragging
        track.addEventListener('click', (e) => {
          if (isDragging) {
            e.preventDefault();
          }
        });
      });

      // Search and Category Filtering
      const searchInput = document.getElementById('searchInput');
      const categoryBtns = document.querySelectorAll('.category-btn');
      const linkItems = document.querySelectorAll('.link-item-container');
      
      let activeCategory = 'All';
      let searchQuery = '';

      function filterLinks() {
        linkItems.forEach(item => {
          const title = item.getAttribute('data-title') || '';
          const category = item.getAttribute('data-category') || '';
          const isPinned = item.getAttribute('data-pinned') === 'true';
          
          const matchesSearch = title.includes(searchQuery);
          const matchesCategory = activeCategory === 'All' || category === activeCategory;
          
          if (isPinned || (matchesSearch && matchesCategory)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value.toLowerCase();
          filterLinks();
        });
      }

      if (categoryBtns) {
        categoryBtns.forEach(btn => {
          btn.addEventListener('click', () => {
            // Update active class
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update filter
            activeCategory = btn.getAttribute('data-category') || 'All';
            filterLinks();
          });
        });
      }
    });
  </script>
  ${settings.histatsCode ? `
  <!-- Histats Code -->
  ${settings.histatsCode.replace(/&(?!amp;|#)/g, '&amp;')}
  <!-- End Histats Code -->
  ` : ''}
</body>
</html>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateBloggerXML());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPreviewShadowClass = () => {
    if (profile.cardShadow === 'none') return 'shadow-none border border-gray-300';
    if (profile.cardShadow === 'hard') return 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black';
    return 'shadow-sm border border-black/5'; // soft
  };

  const getPreviewHoverAnimClass = () => {
    if (profile.hoverAnimation === 'scale') return 'preview-hover-scale';
    if (profile.hoverAnimation === 'wiggle') return 'preview-hover-wiggle';
    if (profile.hoverAnimation === 'glow') return 'preview-hover-glow';
    return 'preview-hover-translate';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* LEFT PANEL - EDITOR */}
      <div className={`w-full md:w-1/2 lg:w-5/12 bg-white border-r border-gray-200 flex flex-col h-screen overflow-hidden transition-all duration-500 ${!isLicensed ? 'blur-md grayscale pointer-events-none select-none' : ''}`}>
        <div className="p-6 border-b border-gray-200 bg-white z-10 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              ReDi Biolink Generator
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500">Blogspot Theme Generator for Affiliates</p>
              {currentProjectId && (
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold border border-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  Project: {projects.find(p => p.id === currentProjectId)?.name}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (!currentProjectId) {
                const name = prompt('Masukkan nama project:', 'Project Baru');
                if (name) saveCurrentToProject(name);
              } else {
                saveCurrentToProject();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all shadow-md active:scale-95"
          >
            <Save size={18} />
            <span className="hidden sm:inline">{currentProjectId ? 'Update' : 'Simpan'}</span>
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <User size={16} /> Profile
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'links' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LinkIcon size={16} /> Links
          </button>
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'design' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Paintbrush size={16} /> Design
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'projects' ? 'border-b-2 border-blue-600 text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FolderOpen size={16} /> Projects
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <div className="flex gap-1 mt-1.5 overflow-x-auto hide-scrollbar pb-1">
                  {EMOJI_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setProfile({ ...profile, name: profile.name + ' ' + emoji })}
                      className="text-xs flex-none hover:bg-gray-200 p-1 rounded transition-colors"
                      title={`Tambah ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <div className="flex gap-1 mt-1.5 overflow-x-auto hide-scrollbar pb-1">
                  {EMOJI_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setProfile({ ...profile, bio: profile.bio + ' ' + emoji })}
                      className="text-xs flex-none hover:bg-gray-200 p-1 rounded transition-colors"
                      title={`Tambah ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">💡 Ide Copywriting Bio:</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setProfile({ ...profile, bio: e.target.value });
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white text-gray-700 cursor-pointer"
                  >
                    <option value="" disabled>Pilih template bio...</option>
                    {BIO_PRESETS.map((preset, idx) => (
                      <option key={idx} value={preset.value}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                <p className="font-semibold mb-1">💡 Pro Tip Affiliate:</p>
                <p>Gunakan <strong>Drag & Drop</strong> (icon titik enam di kiri) untuk mengatur urutan produk dengan mudah.</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddLink('link')}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={14} /> Link Produk
                </button>
                <button
                  onClick={() => handleAddLink('text')}
                  className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <AlignLeft size={14} /> Blok Teks
                </button>
                <button
                  onClick={() => handleAddLink('banner')}
                  className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <BannerIcon size={14} /> Banner
                </button>
              </div>

              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={links.map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {links.map((link, index) => (
                      <SortableLinkItem key={link.id} link={link} index={index}>
                        <div className={`p-5 bg-white border-2 rounded-2xl relative shadow-sm transition-colors ${link.type === 'text' ? 'border-amber-100' : link.type === 'banner' ? 'border-purple-100' : 'border-gray-100'} hover:border-blue-200 pl-10`}>
                          <div className="absolute -left-3 -top-3 bg-blue-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shadow-md z-10">
                            {index + 1}
                          </div>
                          
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            {link.type === 'link' && (
                              <button
                                onClick={() => {
                                  const newLinks = [...links];
                                  newLinks[index].isPinned = !newLinks[index].isPinned;
                                  setLinks(newLinks);
                                }}
                                className={`transition-colors p-2 rounded-full ${link.isPinned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'}`}
                                title={link.isPinned ? "Unpin Product" : "Pin Product"}
                              >
                                <Pin size={16} className={link.isPinned ? "fill-current" : ""} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const newLinks = [...links];
                                newLinks.splice(index, 0, { ...link, id: Date.now().toString() });
                                setLinks(newLinks);
                              }}
                              className="text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full"
                              title="Duplicate"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-2 rounded-full"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="space-y-4 pr-8">
                            {link.type === 'text' ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><AlignLeft size={12}/> Isi Teks</label>
                                  <textarea
                                    value={link.content || ''}
                                    onChange={(e) => handleUpdateLink(link.id, 'content', e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="Tulis pesan atau info di sini..."
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Type size={12}/> Ukuran Teks</label>
                                  <select
                                    value={link.badge || 'normal'}
                                    onChange={(e) => handleUpdateLink(link.id, 'badge', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                  >
                                    <option value="small">Kecil</option>
                                    <option value="normal">Normal</option>
                                    <option value="large">Besar (Heading)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><AlignLeft size={12}/> Perataan Teks</label>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'textAlign', 'left')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${(!link.textAlign || link.textAlign === 'left') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Kiri
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'textAlign', 'center')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${link.textAlign === 'center' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Tengah
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'textAlign', 'right')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${link.textAlign === 'right' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Kanan
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : link.type === 'banner' ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><BannerIcon size={12}/> URL Gambar Banner</label>
                                  <input
                                    type="text"
                                    value={link.image || ''}
                                    onChange={(e) => handleUpdateLink(link.id, 'image', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="https://..."
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><LinkIcon size={12}/> Link Tujuan (Opsional)</label>
                                  <input
                                    type="text"
                                    value={link.url || ''}
                                    onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                    placeholder="https://..."
                                  />
                                </div>
                              </div>
                            ) : (
                              <>
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Type size={12}/> Judul Link</label>
                                    <input
                                      type="text"
                                      value={link.title}
                                      onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                      placeholder="Contoh: Skincare Viral"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><LinkIcon size={12}/> URL Tujuan</label>
                                    <input
                                      type="text"
                                      value={link.url}
                                      onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                      placeholder="https://shopee..."
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Tag size={12}/> Kategori (Opsional)</label>
                                    <input
                                      type="text"
                                      value={link.category || ''}
                                      onChange={(e) => handleUpdateLink(link.id, 'category', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                      placeholder="Misal: Skincare, Fashion, Promo..."
                                    />
                                  </div>
                                </div>

                                {/* Layout Selector */}
                                <div className="pt-3 border-t border-gray-100">
                                  <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1"><LayoutTemplate size={12}/> Tampilan Link</label>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'layout', 'standard')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${(!link.layout || link.layout === 'standard') ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Tombol
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'layout', 'card')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${link.layout === 'card' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Card
                                    </button>
                                    <button
                                      onClick={() => handleUpdateLink(link.id, 'layout', 'carousel')}
                                      className={`flex-1 py-1.5 text-xs font-medium rounded-md border ${link.layout === 'carousel' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                      Carousel
                                    </button>
                                  </div>
                                </div>

                                {/* Conditional Inputs based on Layout */}
                                <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {link.layout === 'carousel' ? (
                                    <div className="col-span-1 md:col-span-2 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><LayoutTemplate size={12}/> Item Katalog</label>
                                        <button onClick={() => handleAddCarouselItem(link.id)} className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
                                          <Plus size={12} /> Tambah
                                        </button>
                                      </div>
                                      <div className="space-y-3">
                                        {(link.carouselItems || []).map((item) => (
                                          <div key={item.id} className="p-3 bg-white border border-gray-200 rounded-lg relative group">
                                            <button
                                              onClick={() => handleDeleteCarouselItem(link.id, item.id)}
                                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <Trash2 size={12} />
                                            </button>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div className="col-span-2">
                                                <input type="text" value={item.title} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'title', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Nama Produk" />
                                              </div>
                                              <div>
                                                <input type="text" value={item.price || ''} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'price', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Harga" />
                                              </div>
                                              <div>
                                                <input type="text" value={item.rating || ''} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'rating', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Rating" />
                                              </div>
                                              <div className="col-span-2">
                                                <input type="text" value={item.soldCount || ''} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'soldCount', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Terjual (Cth: 1RB+)" />
                                              </div>
                                              <div className="col-span-2">
                                                <input type="text" value={item.url} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'url', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Link (https://...)" />
                                              </div>
                                              <div className="col-span-2">
                                                <input type="text" value={item.image} onChange={(e) => handleUpdateCarouselItem(link.id, item.id, 'image', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none" placeholder="URL Gambar" />
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="col-span-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><ImageIcon size={12}/> URL Gambar (Opsional)</label>
                                        <input
                                          type="text"
                                          value={link.image || ''}
                                          onChange={(e) => handleUpdateLink(link.id, 'image', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                          placeholder="https://..."
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Type size={12}/> Subtitle / Harga</label>
                                        <input
                                          type="text"
                                          value={link.subtitle || ''}
                                          onChange={(e) => handleUpdateLink(link.id, 'subtitle', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                          placeholder="Contoh: Rp 99.000"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Tag size={12}/> Badge FOMO</label>
                                        <input
                                          type="text"
                                          value={link.badge || ''}
                                          onChange={(e) => handleUpdateLink(link.id, 'badge', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                          placeholder="Cth: HOT, PROMO"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">⭐ Rating</label>
                                        <input
                                          type="text"
                                          value={link.rating || ''}
                                          onChange={(e) => handleUpdateLink(link.id, 'rating', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                          placeholder="Cth: 4.9"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">📦 Terjual</label>
                                        <input
                                          type="text"
                                          value={link.soldCount || ''}
                                          onChange={(e) => handleUpdateLink(link.id, 'soldCount', e.target.value)}
                                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white"
                                          placeholder="Cth: 1RB+"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </SortableLinkItem>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 text-sm text-purple-800 mb-4">
                <p className="font-semibold mb-1">✨ Tema Instan:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {THEME_PRESETS.map((theme, idx) => (
                    <button
                      key={idx}
                      onClick={() => setProfile({
                        ...profile,
                        bgColor: theme.bgColor,
                        cardBgColor: theme.cardBgColor,
                        btnColor: theme.btnColor,
                        textColor: theme.textColor
                      })}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-purple-200 hover:bg-purple-100 transition-colors"
                      style={{ backgroundColor: theme.bgColor, color: theme.textColor, borderColor: theme.btnColor }}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaya Huruf (Font)</label>
                  <select
                    value={profile.fontFamily}
                    onChange={(e) => setProfile({ ...profile, fontFamily: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    {FONT_OPTIONS.map((font, idx) => (
                      <option key={idx} value={font.value}>{font.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bentuk Tombol</label>
                  <select
                    value={profile.buttonStyle}
                    onChange={(e) => setProfile({ ...profile, buttonStyle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="rounded-none">Kotak (Square)</option>
                    <option value="rounded-xl">Melengkung (Rounded)</option>
                    <option value="rounded-full">Kapsul (Pill)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Animasi Hover Tombol</label>
                  <select
                    value={profile.hoverAnimation}
                    onChange={(e) => setProfile({ ...profile, hoverAnimation: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="translate">Naik (Translate-Y)</option>
                    <option value="scale">Membesar (Scale)</option>
                    <option value="wiggle">Goyang (Wiggle)</option>
                    <option value="glow">Bersinar (Glow)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gaya Bayangan (Shadow)</label>
                  <select
                    value={profile.cardShadow}
                    onChange={(e) => setProfile({ ...profile, cardShadow: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="none">Flat (Tanpa Bayangan)</option>
                    <option value="soft">Soft Shadow (Elegan)</option>
                    <option value="hard">Hard Shadow (Brutalist/Retro)</option>
                  </select>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Image (Opsional)</label>
                <input
                  type="text"
                  value={profile.bgImageUrl}
                  onChange={(e) => setProfile({ ...profile, bgImageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white mb-3"
                  placeholder="URL Gambar (https://...)"
                />
                
                {profile.bgImageUrl && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Efek Transparansi (Overlay)</label>
                      <select
                        value={profile.bgOverlay}
                        onChange={(e) => setProfile({ ...profile, bgOverlay: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="none">Tanpa Overlay (Asli)</option>
                        <option value="dark">Gelap (Dark 50%)</option>
                        <option value="light">Terang (Light 50%)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Efek Blur (Kaca)</label>
                      <select
                        value={profile.bgBlur}
                        onChange={(e) => setProfile({ ...profile, bgBlur: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      >
                        <option value="none">Tanpa Blur</option>
                        <option value="sm">Blur Tipis (Small)</option>
                        <option value="md">Blur Sedang (Medium)</option>
                        <option value="lg">Blur Tebal (Large)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background Color (Latar Belakang)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.bgColor}
                    onChange={(e) => setProfile({ ...profile, bgColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={profile.bgColor}
                    onChange={(e) => setProfile({ ...profile, bgColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card / Box Color (Warna Kotak Produk)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.cardBgColor}
                    onChange={(e) => setProfile({ ...profile, cardBgColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={profile.cardBgColor}
                    onChange={(e) => setProfile({ ...profile, cardBgColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Button / Accent Color (Warna Tombol)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.btnColor}
                    onChange={(e) => setProfile({ ...profile, btnColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={profile.btnColor}
                    onChange={(e) => setProfile({ ...profile, btnColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color (Warna Teks)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={profile.textColor}
                    onChange={(e) => setProfile({ ...profile, textColor: e.target.value })}
                    className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                  />
                  <input
                    type="text"
                    value={profile.textColor}
                    onChange={(e) => setProfile({ ...profile, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-1">
                  <Settings size={16} /> Tracking & SEO Settings
                </h4>
                <p className="text-xs text-blue-600">Konfigurasi analytics dan tracking pixel untuk biolink Anda.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="G-XXXXXXXXXX"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Masukkan ID Tracking Google Analytics 4 (GA4).</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Meta Pixel ID (Facebook)</label>
                  <input
                    type="text"
                    value={settings.metaPixelId}
                    onChange={(e) => setSettings({ ...settings, metaPixelId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="123456789012345"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Masukkan ID Pixel Facebook/Meta Anda.</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Histats Code (Optional)</label>
                  <textarea
                    value={settings.histatsCode}
                    onChange={(e) => setSettings({ ...settings, histatsCode: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                    placeholder="<!-- Histats.com  START  (aync)-->..."
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Paste kode tracking Histats Anda di sini.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-1">UTM Tags (Auto-append to URLs)</label>
                  <input
                    type="text"
                    value={settings.utmTags}
                    onChange={(e) => setSettings({ ...settings, utmTags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                    placeholder="utm_source=biolink&utm_medium=social"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Format: key1=val1&key2=val2. Akan otomatis ditambahkan ke semua link.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">My Projects</h3>
                <button 
                  onClick={createNewProject}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  title="New Project"
                >
                  <FilePlus size={20} />
                </button>
              </div>

              {!currentProjectId && (
                <button 
                  onClick={() => {
                    const name = prompt('Nama project baru:', 'Project Baru');
                    if (name) saveCurrentToProject(name);
                  }}
                  className="w-full py-4 bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-all active:scale-95"
                >
                  <Save size={18} /> Simpan Project Saat Ini
                </button>
              )}

              {currentProjectId && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Current Project</span>
                    <span className="text-[10px] text-blue-400">ID: {currentProjectId}</span>
                  </div>
                  <input 
                    type="text"
                    value={projects.find(p => p.id === currentProjectId)?.name || ''}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setProjects(prev => prev.map(p => p.id === currentProjectId ? { ...p, name: newName } : p));
                    }}
                    className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Project Name"
                  />
                  <button 
                    onClick={() => saveCurrentToProject()}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Saved Projects ({projects.length})</label>
                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                      <FolderOpen size={32} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Belum ada project tersimpan</p>
                    <p className="text-xs text-gray-500 mb-6">Klik tombol di bawah untuk menyimpan desain saat ini ke browser Anda.</p>
                    <button 
                      onClick={() => {
                        const name = prompt('Masukkan nama project:', 'Project Baru');
                        if (name) saveCurrentToProject(name);
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all mx-auto shadow-md active:scale-95"
                    >
                      <Save size={16} /> Simpan Sekarang
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {[...projects].sort((a, b) => b.lastModified - a.lastModified).map(project => (
                      <div 
                        key={project.id} 
                        className={`p-4 rounded-xl border-2 transition-all group ${currentProjectId === project.id ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex-none overflow-hidden border border-gray-200">
                              <img src={project.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="overflow-hidden">
                              <h4 className="font-bold text-sm text-gray-900 truncate">{project.name}</h4>
                              <p className="text-[10px] text-gray-500">{new Date(project.lastModified).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteProject(project.id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md"
                              title="Delete"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                        <button 
                          onClick={() => loadProject(project)}
                          className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors ${currentProjectId === project.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {currentProjectId === project.id ? 'Currently Editing' : 'Load Project'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleExportData}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
            >
              <Download size={16} /> Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm active:scale-95"
            >
              <Upload size={16} /> Import JSON
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleImportData}
              className="hidden"
            />
          </div>
          <button
            onClick={() => {
              if (isLicensed) {
                setShowCode(true);
              } else {
                setShowLicenseModal(true);
              }
            }}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20 relative overflow-hidden"
          >
            {!isLicensed && <div className="absolute top-0 right-0 bg-amber-500 text-[10px] px-2 py-0.5 text-black font-black uppercase">Locked</div>}
            <Code size={18} /> Generate Blogspot Code
          </button>
        </div>
      </div>

      {/* RIGHT PANEL - PREVIEW / CODE */}
      <div className={`w-full md:w-1/2 lg:w-7/12 bg-gray-100 flex items-center justify-center p-4 md:p-8 h-screen overflow-hidden relative transition-all duration-500 ${!isLicensed ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {!showCode ? (
          <div className="relative w-full max-w-[360px] h-[750px] bg-white rounded-[3rem] border-[10px] border-gray-900 shadow-2xl overflow-hidden flex flex-col">
            {/* Phone Notch */}
            <div className="absolute top-0 inset-x-0 h-6 bg-gray-900 rounded-b-3xl w-40 mx-auto z-20"></div>
            
            {/* Background Layer */}
            <div 
              className="absolute inset-0 z-0"
              style={{ 
                backgroundColor: profile.bgColor, 
                backgroundImage: profile.bgImageUrl ? `url('${profile.bgImageUrl}')` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {profile.bgImageUrl && (
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundColor: profile.bgOverlay === 'dark' ? 'rgba(0,0,0,0.5)' : profile.bgOverlay === 'light' ? 'rgba(255,255,255,0.5)' : 'transparent',
                    backdropFilter: profile.bgBlur === 'sm' ? 'blur(4px)' : profile.bgBlur === 'md' ? 'blur(8px)' : profile.bgBlur === 'lg' ? 'blur(16px)' : 'none',
                    WebkitBackdropFilter: profile.bgBlur === 'sm' ? 'blur(4px)' : profile.bgBlur === 'md' ? 'blur(8px)' : profile.bgBlur === 'lg' ? 'blur(16px)' : 'none',
                  }}
                />
              )}
            </div>

            {/* Live Preview Content */}
            <div 
              className="flex-1 overflow-y-auto hide-scrollbar relative z-10"
              style={{ fontFamily: profile.fontFamily }}
            >
              <style>{`
                .preview-hover-translate:hover { transform: translateY(-4px); }
                .preview-hover-scale:hover { transform: scale(1.03); }
                .preview-hover-wiggle:hover { animation: wiggle 0.4s ease-in-out infinite; }
                .preview-hover-glow:hover { box-shadow: 0 0 20px ${profile.btnColor}; transform: translateY(-1px); }
                @keyframes wiggle {
                  0%, 100% { transform: rotate(-3deg); }
                  50% { transform: rotate(3deg); }
                }
              `}</style>
              <div className="flex flex-col items-center px-5 py-14 min-h-full" style={{ color: profile.textColor }}>
                <img 
                  src={profile.avatarUrl} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover mb-4 shadow-lg"
                  style={{ border: `4px solid ${profile.cardBgColor}` }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/fallback/200/200';
                  }}
                />
                <h1 className="text-2xl font-extrabold mb-1 text-center tracking-tight">{profile.name}</h1>
                <p className="text-[0.95rem] opacity-80 mb-6 text-center whitespace-pre-wrap leading-relaxed">{profile.bio}</p>

                <div className="w-full mb-6">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari produk..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white/90 backdrop-blur-md border border-white/40 rounded-full text-[0.9rem] font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:bg-white focus:border-blue-500 transition-all shadow-sm"
                      style={{ color: '#1f2937' }}
                    />
                  </div>
                </div>

                {categories.length > 1 && (
                  <div className="w-full flex gap-2 overflow-x-auto hide-scrollbar mb-6 pb-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`flex-none px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${activeCategory === cat ? 'shadow-md' : 'opacity-70 hover:opacity-100'}`}
                        style={{ 
                          backgroundColor: activeCategory === cat ? profile.btnColor : 'rgba(255,255,255,0.2)',
                          color: activeCategory === cat ? '#fff' : profile.textColor
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="w-full flex flex-col gap-4">
                  {filteredLinks.map((link) => {
                    if (link.type === 'text') {
                      const fontSize = link.badge === 'small' ? 'text-xs' : link.badge === 'large' ? 'text-lg font-bold' : 'text-sm';
                      const alignment = link.textAlign === 'left' ? 'text-left' : link.textAlign === 'right' ? 'text-right' : 'text-center';
                      return (
                        <div key={link.id} className={`w-full px-4 py-2 opacity-90 ${fontSize} ${alignment}`} style={{ color: profile.textColor }}>
                          {link.content}
                        </div>
                      );
                    }

                    if (link.type === 'banner') {
                      return (
                        <div key={link.id} className="w-full mb-2">
                          {link.url ? (
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl shadow-md transition-transform hover:scale-[1.02]">
                              <img src={link.image} alt="Banner" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                            </a>
                          ) : (
                            <div className="overflow-hidden rounded-xl shadow-md">
                              <img src={link.image} alt="Banner" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                        </div>
                      );
                    }

                    const isCarousel = link.layout === 'carousel';
                    const isCard = link.layout === 'card' || (!link.layout && (link.image || link.subtitle));
                    
                    if (isCarousel) {
                      return (
                        <div key={link.id} className="w-full mb-4 relative">
                          <div className="flex justify-between items-center mb-3 px-1">
                            <h3 className="font-bold text-[1.05rem]" style={{ color: profile.textColor }}>{link.title}</h3>
                            {link.badge && (
                              <div className="bg-red-500 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                                {link.badge}
                              </div>
                            )}
                          </div>
                          <div 
                            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing" 
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            onMouseDown={(e) => {
                              const slider = e.currentTarget;
                              slider.dataset.isDown = 'true';
                              slider.dataset.startX = (e.pageX - slider.offsetLeft).toString();
                              slider.dataset.scrollLeft = slider.scrollLeft.toString();
                              slider.style.scrollSnapType = 'none';
                              slider.dataset.isDragging = 'false';
                            }}
                            onMouseLeave={(e) => {
                              const slider = e.currentTarget;
                              slider.dataset.isDown = 'false';
                              slider.style.scrollSnapType = 'x mandatory';
                            }}
                            onMouseUp={(e) => {
                              const slider = e.currentTarget;
                              slider.dataset.isDown = 'false';
                              slider.style.scrollSnapType = 'x mandatory';
                            }}
                            onMouseMove={(e) => {
                              const slider = e.currentTarget;
                              if (slider.dataset.isDown !== 'true') return;
                              e.preventDefault();
                              slider.dataset.isDragging = 'true';
                              const x = e.pageX - slider.offsetLeft;
                              const walk = (x - parseFloat(slider.dataset.startX || '0')) * 2;
                              slider.scrollLeft = parseFloat(slider.dataset.scrollLeft || '0') - walk;
                            }}
                            onClickCapture={(e) => {
                              const slider = e.currentTarget;
                              if (slider.dataset.isDragging === 'true') {
                                e.preventDefault();
                                e.stopPropagation();
                                slider.dataset.isDragging = 'false';
                              }
                            }}
                          >
                            {(link.carouselItems || []).map(item => (
                              <div 
                                key={item.id} 
                                className={`flex-none w-[140px] snap-start overflow-hidden flex flex-col transition-all duration-300 ${getPreviewHoverAnimClass()} ${profile.buttonStyle} ${getPreviewShadowClass()}`}
                                style={{ backgroundColor: profile.cardBgColor }}
                              >
                                <img src={item.image || 'https://picsum.photos/seed/placeholder/150/150'} alt={item.title} className="w-full h-[140px] object-cover bg-gray-100" />
                                <div className="p-3 flex flex-col gap-1">
                                  <div className="font-semibold text-[0.85rem] truncate" style={{ color: profile.textColor }}>{item.title}</div>
                                  {item.price && (
                                    <div className="font-bold text-[0.8rem]" style={{ color: profile.btnColor }}>{item.price}</div>
                                  )}
                                  {(item.rating || item.soldCount) && (
                                    <div className="flex items-center gap-1.5 text-[0.7rem] mt-0.5">
                                      {item.rating && <div className="text-amber-500 font-bold flex items-center">⭐ {item.rating}</div>}
                                      {item.soldCount && <div className="opacity-65 font-medium" style={{ color: profile.textColor }}>{item.soldCount} Terjual</div>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {(!link.carouselItems || link.carouselItems.length === 0) && (
                              <div className="flex-none w-[140px] h-[200px] snap-start rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs text-center p-4">
                                Belum ada produk
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    } else if (isCard) {
                      return (
                        <div
                          key={link.id}
                          className={`w-full p-3 flex items-center relative transition-all duration-300 ${getPreviewHoverAnimClass()} ${profile.buttonStyle} ${getPreviewShadowClass()}`}
                          style={{ backgroundColor: profile.cardBgColor }}
                        >
                          {link.badge && (
                            <div className="absolute -top-2.5 -right-1.5 bg-red-500 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                              {link.badge}
                            </div>
                          )}
                          {link.image && (
                            <img src={link.image} alt={link.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                          )}
                          <div className="flex-1 px-3 overflow-hidden text-left">
                            <div className="font-bold text-[0.95rem] truncate" style={{ color: profile.textColor }}>{link.title}</div>
                            {link.subtitle && (
                              <div className="text-xs mt-0.5 truncate opacity-70" style={{ color: profile.textColor }}>{link.subtitle}</div>
                            )}
                            {(link.rating || link.soldCount) && (
                              <div className="flex items-center gap-1.5 text-[0.7rem] mt-1">
                                {link.rating && <div className="text-amber-500 font-bold flex items-center">⭐ {link.rating}</div>}
                                {link.soldCount && <div className="opacity-65 font-medium" style={{ color: profile.textColor }}>{link.soldCount} Terjual</div>}
                              </div>
                            )}
                          </div>
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-1"
                            style={{ backgroundColor: profile.btnColor, color: '#fff' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={link.id}
                        className={`w-full py-4 px-6 text-center font-bold text-white transition-all duration-300 relative ${getPreviewHoverAnimClass()} ${profile.buttonStyle} ${getPreviewShadowClass()}`}
                        style={{ backgroundColor: profile.btnColor }}
                      >
                        {link.badge && (
                          <div className="absolute -top-2.5 -right-1.5 bg-red-500 text-white text-[0.65rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                            {link.badge}
                          </div>
                        )}
                        <div className="flex flex-col items-center gap-1">
                          <span>{link.title}</span>
                          {(link.rating || link.soldCount) && (
                            <div className="flex items-center justify-center gap-1.5 text-[0.7rem] font-medium opacity-90">
                              {link.rating && <div className="text-amber-300 font-bold flex items-center">⭐ {link.rating}</div>}
                              {link.soldCount && <div className="text-white">{link.soldCount} Terjual</div>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-12 text-xs opacity-60 font-medium text-center">
                  &copy; 2024 - 2026 <a href="https://www.redi.web.id/" target="_blank" rel="noopener noreferrer" className="hover:underline">ReDi (Revolusi Digital)</a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl h-full max-h-[800px] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Code size={18} className="text-blue-400" /> Blogspot XML Theme
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCode(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Back to Preview
                </button>
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${
                    copied ? 'bg-green-500/20 text-green-400' : 'bg-blue-600 text-white hover:bg-blue-500'
                  }`}
                >
                  {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Code</>}
                </button>
              </div>
            </div>
            <div className="p-6 bg-[#0d1117] flex-1 overflow-auto">
              <div className="mb-4 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg text-blue-200 text-sm flex items-start gap-3">
                <ExternalLink size={18} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Cara Pasang di Blogspot:</p>
                  <ol className="list-decimal ml-4 space-y-1 opacity-90">
                    <li>Buka dashboard Blogger lo.</li>
                    <li>Masuk ke menu <strong>Theme (Tema)</strong>.</li>
                    <li>Klik icon panah bawah di sebelah tombol Customize, pilih <strong>Edit HTML</strong>.</li>
                    <li>Hapus SEMUA kode yang ada di situ (Ctrl+A lalu Delete).</li>
                    <li>Paste kode di bawah ini, lalu klik <strong>Save (Simpan)</strong>.</li>
                  </ol>
                </div>
              </div>
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">
                <code>{generateBloggerXML()}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
      {/* License Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 relative z-[10000]"
            >
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Aktivasi License</h2>
                <p className="text-gray-500 text-sm mb-8">Masukkan License Key lo buat ngebuka fitur <strong>Generate Blogspot Code</strong>.</p>
                
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={licenseKey}
                      onChange={(e) => {
                        setLicenseKey(e.target.value);
                        if (licenseError) setLicenseError('');
                      }}
                      placeholder="Masukkan License Key..."
                      className={`w-full px-5 py-4 bg-gray-50 border ${licenseError ? 'border-red-300 ring-4 ring-red-500/10' : 'border-gray-200'} rounded-2xl text-center font-mono text-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all`}
                    />
                    <AnimatePresence>
                      {licenseError && (
                        <motion.p 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-red-500 text-xs font-bold"
                        >
                          {licenseError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => verifyLicense(licenseKey)}
                    disabled={verifyingLicense}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {verifyingLicense ? 'Memverifikasi...' : 'Aktivasi Sekarang'}
                  </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Belum punya license? <a href="https://www.redi.web.id/" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline">Beli di sini</a></p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[100]"
          >
            <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-gray-800">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-sm font-bold">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
