import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Share2, Sparkles, Layout, LogOut, ArrowLeft, Image as ImageIcon, Loader2, Check, Upload, X } from 'lucide-react';
import { Collection, LinkItem, User } from './types';
import { MockDb } from './services/mockDb';
import { GeminiService } from './services/geminiService';
import { Button, Input, Card, Modal } from './components/Shared';

// --- Components ---

const Navbar: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-indigo-600">LinkLoom</span>
      </Link>
      <div className="flex items-center gap-3 sm:gap-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-brand-600 hidden xs:block">Dashboard</Link>
            <div className="h-4 w-px bg-slate-200 hidden xs:block"></div>
            <span className="text-sm text-slate-500 hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={onLogout} title="Log out">
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="primary" className="text-sm px-3 py-1.5 sm:px-4 sm:py-2">Sign In</Button>
          </Link>
        )}
      </div>
    </div>
  </nav>
);

const LandingPage = () => (
  <div className="flex flex-col min-h-[calc(100vh-64px)] justify-center items-center text-center px-4 py-12">
    <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom-5 duration-700">
      <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-slate-900">
        Curate your <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-600">Digital World</span>
      </h1>
      <p className="text-base sm:text-lg text-slate-600 leading-relaxed px-4">
        Create beautiful, shareable collections of links. Organize your reading lists, 
        project resources, or inspiration boards in seconds.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 w-full sm:w-auto px-6">
        <Link to="/login" className="w-full sm:w-auto">
          <Button className="h-12 px-8 text-lg w-full sm:w-auto">Get Started</Button>
        </Link>
        <Button variant="secondary" className="h-12 px-8 text-lg w-full sm:w-auto" onClick={() => window.open('https://github.com', '_blank')}>
          Github
        </Button>
      </div>
    </div>
    
    <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full px-4">
      {[
        { title: "Collect", icon: Layout, desc: "Save links from anywhere with rich previews." },
        { title: "Organize", icon: Sparkles, desc: "AI-powered tools to sort and describe items." },
        { title: "Share", icon: Share2, desc: "One link to share your entire collection." }
      ].map((feature, i) => (
        <Card key={i} className="p-6 text-left hover:shadow-lg transition-all duration-300">
          <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-4">
            <feature.icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
          <p className="text-slate-500 text-sm">{feature.desc}</p>
        </Card>
      ))}
    </div>
  </div>
);

const AuthPage: React.FC<{ onLogin: (email: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(email);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-12">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Enter your email to sign in or create an account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Email address" 
            type="email" 
            required 
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" className="w-full h-11" isLoading={isLoading}>
            Continue with Email
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
};

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    MockDb.getCollections(user.id).then(cols => {
      setCollections(cols);
      setLoading(false);
    });
  }, [user.id]);

  const handleCreate = async () => {
    const newCol: Collection = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: 'Untitled Collection',
      description: '',
      items: [],
      isPublic: true,
      theme: 'light',
      createdAt: Date.now()
    };
    await MockDb.saveCollection(newCol);
    navigate(`/edit/${newCol.id}`);
  };

  const handleShare = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const url = `${window.location.href.split('#')[0]}#/share/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-brand-500" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Collections</h1>
        <Button onClick={handleCreate} className="gap-2 text-sm sm:text-base">
          <Plus className="w-4 h-4" /> <span className="hidden xs:inline">New Collection</span><span className="xs:hidden">New</span>
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
          <Layout className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No collections yet</h3>
          <p className="text-slate-500 mb-6 px-4">Create your first collection to start sharing.</p>
          <Button variant="secondary" onClick={handleCreate}>Create Now</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(col => (
            <Card key={col.id} onClick={() => navigate(`/edit/${col.id}`)} className="group h-64 flex flex-col relative transition-all hover:ring-2 hover:ring-brand-500/20">
              <div className="h-32 bg-slate-100 flex items-center justify-center overflow-hidden relative">
                {col.items.length > 0 ? (
                  <div className="grid grid-cols-2 w-full h-full">
                     {col.items.slice(0, 4).map((item, idx) => (
                       <img key={idx} src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                     ))}
                  </div>
                ) : (
                   <ImageIcon className="text-slate-300 w-8 h-8" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg text-slate-900 mb-1 truncate">{col.title}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{col.description || "No description"}</p>
                <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span>{col.items.length} items</span>
                  <div className="flex gap-3 items-center">
                    <span>{new Date(col.createdAt).toLocaleDateString()}</span>
                    <button 
                      onClick={(e) => handleShare(e, col.id)}
                      className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-500 z-10"
                      title="Copy Link"
                    >
                      {copiedId === col.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const CollectionEditor: React.FC<{ user: User }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // New Item State
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');

  useEffect(() => {
    if (!id) return;
    MockDb.getCollectionById(id).then(c => {
      if (c && c.userId === user.id) {
        setCollection(c);
      } else {
        navigate('/dashboard'); // Not found or unauthorized
      }
      setLoading(false);
    });
  }, [id, user.id, navigate]);

  const handleSave = async (updated: Collection) => {
    setCollection(updated);
    await MockDb.saveCollection(updated);
  };

  const handleShare = async () => {
    if (!collection) return;
    const url = `${window.location.href.split('#')[0]}#/share/${collection.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size limit check (1MB)
      if (file.size > 1024 * 1024) {
        alert("File too large. Please use an image smaller than 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = async () => {
    if (!collection || !newItemUrl) return;
    
    // Auto-fill title if empty using "AI" (simulated or real if configured)
    let finalTitle = newItemTitle;
    if (!finalTitle) {
      finalTitle = await GeminiService.suggestLinkTitle(newItemUrl);
    }
    
    // Auto-fill image if empty
    let finalImage = newItemImage;
    if (!finalImage) {
      finalImage = `https://picsum.photos/seed/${Math.random()}/400/300`;
    }

    const newItem: LinkItem = {
      id: crypto.randomUUID(),
      url: newItemUrl,
      title: finalTitle,
      imageUrl: finalImage,
      description: ''
    };

    const updated = { ...collection, items: [newItem, ...collection.items] };
    await handleSave(updated);
    setIsAddItemOpen(false);
    setNewItemUrl('');
    setNewItemTitle('');
    setNewItemImage('');
    setImageMode('url');
  };

  const generateDescription = async () => {
    if (!collection) return;
    setIsAiLoading(true);
    const desc = await GeminiService.generateCollectionDescription(collection.title, collection.items);
    await handleSave({ ...collection, description: desc });
    setIsAiLoading(false);
  };

  const deleteItem = async (itemId: string) => {
    if (!collection) return;
    const updated = { ...collection, items: collection.items.filter(i => i.id !== itemId) };
    await handleSave(updated);
  };

  const deleteCollection = async () => {
    if (!collection || !confirm("Are you sure? This cannot be undone.")) return;
    await MockDb.deleteCollection(collection.id);
    navigate('/dashboard');
  };

  if (loading || !collection) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Actions */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 flex items-center gap-2 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
          <Button variant="ghost" onClick={deleteCollection} className="text-red-500 hover:text-red-600 hover:bg-red-50 text-sm">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button variant="secondary" onClick={handleShare} className="min-w-[100px] transition-all text-sm">
            {copySuccess ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copySuccess ? 'Copied!' : 'Share'}
          </Button>
          <a href={`#/share/${collection.id}`} target="_blank" rel="noreferrer">
             <Button variant="secondary" className="text-sm">
              <ExternalLink className="w-4 h-4 mr-2" /> Preview
            </Button>
          </a>
          <Button onClick={() => setIsAddItemOpen(true)} className="text-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>
      </div>

      {/* Editor Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-700">Collection Title</label>
             <input 
               value={collection.title}
               onChange={(e) => handleSave({ ...collection, title: e.target.value })}
               className="text-2xl sm:text-3xl font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-brand-500 focus:outline-none w-full transition-colors pb-1 placeholder:text-slate-300"
               placeholder="Enter title..."
             />
          </div>
          <div className="space-y-2 relative">
             <label className="text-sm font-medium text-slate-700 flex justify-between">
                <span>Description</span>
                <button 
                  onClick={generateDescription}
                  disabled={isAiLoading || collection.items.length === 0}
                  className="text-xs text-brand-600 font-medium flex items-center hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {isAiLoading ? 'Generating...' : 'Auto-Generate with AI'}
                </button>
             </label>
             <textarea 
               value={collection.description}
               onChange={(e) => handleSave({ ...collection, description: e.target.value })}
               className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none text-slate-600 bg-white"
               placeholder="What is this collection about?"
             />
          </div>
        </div>

        {/* Collection Settings / Stats */}
        <div className="md:col-span-1">
          <Card className="p-5 bg-white border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-4">Settings</h4>
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm text-slate-600">Public Access</span>
               <div 
                 onClick={() => handleSave({ ...collection, isPublic: !collection.isPublic })}
                 className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${collection.isPublic ? 'bg-brand-500' : 'bg-slate-300'}`}
               >
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform ${collection.isPublic ? 'translate-x-4' : ''}`} />
               </div>
            </div>
            <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-200">
               Created {new Date(collection.createdAt).toLocaleDateString()}
            </div>
          </Card>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Items ({collection.items.length})</h3>
        {collection.items.length === 0 ? (
          <div onClick={() => setIsAddItemOpen(true)} className="border-2 border-dashed border-slate-200 rounded-xl p-8 sm:p-12 text-center cursor-pointer hover:border-brand-300 hover:bg-brand-50/50 transition-all bg-white/50">
            <Plus className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">Add your first link</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {collection.items.map(item => (
              <Card key={item.id} className="flex flex-col sm:flex-row p-4 gap-4 items-start sm:items-center group">
                 <div className="w-full sm:w-24 h-48 sm:h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 min-w-0 w-full">
                    <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-brand-600 hover:underline truncate block">{item.url}</a>
                    {item.description && <p className="text-sm text-slate-500 mt-1 line-clamp-1">{item.description}</p>}
                 </div>
                 <div className="flex gap-2 w-full sm:w-auto justify-end sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} className="text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                 </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title="Add New Item">
        <div className="space-y-4">
          <Input 
            label="URL" 
            placeholder="https://..." 
            value={newItemUrl} 
            onChange={(e) => setNewItemUrl(e.target.value)} 
          />
          <Input 
            label="Title (Optional)" 
            placeholder="Leave empty for AI suggestion" 
            value={newItemTitle} 
            onChange={(e) => setNewItemTitle(e.target.value)} 
          />
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">Cover Image</label>
            <div className="flex p-1 bg-slate-100 rounded-lg mb-3 w-fit">
              <button 
                onClick={() => { setImageMode('url'); setNewItemImage(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${imageMode === 'url' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Link URL
              </button>
              <button 
                onClick={() => { setImageMode('upload'); setNewItemImage(''); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${imageMode === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Upload File
              </button>
            </div>

            {imageMode === 'url' ? (
              <Input 
                placeholder="https://example.com/image.jpg"
                value={newItemImage}
                onChange={(e) => setNewItemImage(e.target.value)}
              />
            ) : (
              <div className="border-2 border-dashed border-slate-300 bg-white rounded-lg p-6 hover:bg-slate-50 transition-colors text-center relative">
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                 <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload className="w-8 h-8 text-slate-300" />
                    <span className="text-sm">Click to upload image</span>
                 </div>
              </div>
            )}

            {newItemImage && (
              <div className="mt-3 relative rounded-lg overflow-hidden border border-slate-200 h-32 bg-slate-50">
                 <img src={newItemImage} alt="Preview" className="w-full h-full object-cover" />
                 <button 
                   onClick={() => setNewItemImage('')}
                   className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full backdrop-blur-sm transition-colors"
                   title="Remove image"
                 >
                   <X className="w-4 h-4" />
                 </button>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setIsAddItemOpen(false)}>Cancel</Button>
             <Button onClick={addItem} disabled={!newItemUrl}>Add Item</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const PublicView = () => {
  const { id } = useParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    MockDb.getCollectionById(id).then(c => {
      setCollection(c);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-400" /></div>;
  if (!collection || !collection.isPublic) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Collection Not Found</h1>
      <p className="text-slate-500 mb-6">This collection may be private or deleted.</p>
      <Link to="/"><Button>Go Home</Button></Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
           <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight break-words">{collection.title}</h1>
           {collection.description && (
             <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">{collection.description}</p>
           )}
           <div className="flex items-center justify-center gap-2 pt-4">
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
                {collection.items.length} Links
              </span>
              <span className="text-slate-300">•</span>
              <Link to="/" className="text-brand-600 hover:underline text-sm font-medium">Curated on LinkLoom</Link>
           </div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collection.items.map(item => (
            <a 
              key={item.id} 
              href={item.url} 
              target="_blank" 
              rel="noreferrer" 
              className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100"
            >
              <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                  <ExternalLink className="w-4 h-4 text-slate-700" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-brand-600 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 font-mono truncate mb-3">{new URL(item.url).hostname.replace('www.', '')}</p>
                {item.description && <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>}
              </div>
            </a>
          ))}
        </div>
      </main>

      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>Built with LinkLoom</p>
      </footer>
    </div>
  );
};

// --- Main App Logic ---

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local session
    const currentUser = MockDb.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email: string) => {
    const u = await MockDb.login(email);
    setUser(u);
  };

  const handleLogout = async () => {
    await MockDb.logout();
    setUser(null);
  };

  if (loading) return null;

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/share/:id" element={<PublicView />} />
          <Route path="/*" element={
            <>
              <Navbar user={user} onLogout={handleLogout} />
              <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage onLogin={handleLogin} />} />
                <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
                <Route path="/edit/:id" element={user ? <CollectionEditor user={user} /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </>
          } />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;