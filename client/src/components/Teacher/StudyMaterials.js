import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Upload, Trash2, Eye, Download, Edit, BookOpen, Sparkles, ArrowUpRight, FileBadge2 } from 'lucide-react';

const StudyMaterials = ({ currentUser }) => {
  const [materials, setMaterials] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    class: '',
    materialType: 'pdf',
    file: null,
    externalLink: ''
  });

  const getStudyMaterialsStorageKey = () => {
    const email = currentUser?.email || 'default';
    return `study-materials-data-${email}`;
  };

  const saveStudyMaterialsToStorage = (data) => {
    localStorage.setItem(getStudyMaterialsStorageKey(), JSON.stringify(data));
  };

  useEffect(() => {
    fetchStudyMaterials();
    fetchClasses();
  }, [currentUser?.email]);

  useEffect(() => {
    if (currentUser && currentUser.assignedClass) {
      // Find the class ID that matches the user's assigned class
      const classToSelect = classes.find(cls => cls.className === currentUser.assignedClass);
      if (classToSelect) {
        setFormData(prev => ({
          ...prev,
          class: classToSelect._id
        }));
      }
    }
  }, [classes, currentUser]);

  useEffect(() => {
    if (formData.class) {
      const selectedClass = classes.find(c => c._id === formData.class);
      if (selectedClass) {
        setSubjects(selectedClass.subjects || []);
      }
    } else {
      setSubjects([]);
    }
  }, [formData.class, classes]);

  const [subjects, setSubjects] = useState([]);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      // Filter for classes 8, 9, 10
      let filteredClasses = response.data.data;
      if (filteredClasses) {
        filteredClasses = filteredClasses.filter(cls =>
          ['8', '9', '10'].includes(cls.className)
        );
      }
      if (!filteredClasses || filteredClasses.length === 0) {
        throw new Error('No classes returned');
      }
      setClasses(filteredClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      const mockFallbackClass = {
        _id: 'mock_class_8b',
        className: '8',
        section: 'B',
        subjects: [
          { _id: 'sub_1', subjectName: 'Math', teacher: { name: 'Hetvi' } },
          { _id: 'sub_2', subjectName: 'Science', teacher: { name: 'Mrs. Gupta' } },
          { _id: 'sub_3', subjectName: 'English', teacher: { name: 'Mr. Patel' } },
          { _id: 'sub_4', subjectName: 'Hindi', teacher: { name: 'Mr. Singh' } },
          { _id: 'sub_5', subjectName: 'Gujarati', teacher: { name: 'Mrs. Joshi' } },
          { _id: 'sub_6', subjectName: 'Sanskrit', teacher: { name: 'Mr. Sharma' } }
        ]
      };
      setClasses([mockFallbackClass]);
    }
  };

  const fetchStudyMaterials = async () => {
    const saved = localStorage.getItem(getStudyMaterialsStorageKey());
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMaterials(parsed);
        }
      } catch {
        // Ignore malformed cache and fall back to API.
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/teacher/study-materials', {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 1000
      });
      setMaterials(response.data.data);
      saveStudyMaterialsToStorage(response.data.data);
    } catch (error) {
      console.error('Error fetching study materials:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      class: '',
      materialType: 'pdf',
      file: null,
      externalLink: ''
    });
    setEditingId(null);
  };

  const handleEdit = (material) => {
    setEditingId(material._id);
    setFormData({
      title: material.title || '',
      description: material.description || '',
      subject: material.subject?._id || '',
      class: material.class?._id || '',
      materialType: material.materialType || 'pdf',
      file: null,
      externalLink: material.url || ''
    });
    setShowForm(true);
  };

  const handleDownload = (material) => {
    if (material.url) {
      window.open(material.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (material.file?.path && /^https?:\/\//i.test(material.file.path)) {
      window.open(material.file.path, '_blank', 'noopener,noreferrer');
      return;
    }
    alert('Download is available when the file is served from a public URL.');
  };

  const getMaterialTypeLabel = (type) => {
    if (!type) return 'Material';
    return type === 'document' ? 'Document' : type.toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const existingMaterial = editingId ? materials.find(material => material._id === editingId) : null;

    if (formData.materialType !== 'link' && !formData.file && !existingMaterial?.file) {
      alert('Please select a file to upload');
      return;
    }
    if (formData.materialType === 'link' && !formData.externalLink) {
      alert('Please enter a URL for the link');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('class', formData.class);
      formDataToSend.append('materialType', formData.materialType);

      if (formData.materialType === 'link') {
        formDataToSend.append('url', formData.externalLink);
      } else if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const requestConfig = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/teacher/study-materials/${editingId}`, formDataToSend, requestConfig);
      } else {
        await axios.post('http://localhost:5000/api/teacher/study-materials', formDataToSend, requestConfig);
      }

      const subjectName = subjects.find(subject => subject._id === formData.subject)?.subjectName || formData.subject || 'Unknown Subject';
      const classInfo = classes.find(cls => cls._id === formData.class) || {};
      const materialToStore = {
        _id: editingId || `new_mock_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        teacher: currentUser?._id,
        materialType: formData.materialType,
        class: {
          _id: formData.class,
          className: classInfo.className || 'N/A',
          section: classInfo.section || 'N/A'
        },
        subject: {
          _id: formData.subject,
          subjectName
        },
        url: formData.materialType === 'link' ? formData.externalLink : '',
        file: formData.materialType === 'link'
          ? null
          : formData.file
            ? {
                originalName: formData.file?.name,
                filename: formData.file?.name,
                size: formData.file?.size
              }
            : existingMaterial?.file || null,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setFormData({
        title: '',
        description: '',
        subject: '',
        class: '',
        materialType: 'pdf',
        file: null,
        externalLink: ''
      });
      setMaterials(prev => {
        const updated = editingId
          ? prev.map(material => material._id === editingId ? materialToStore : material)
          : [materialToStore, ...prev];
        saveStudyMaterialsToStorage(updated);
        return updated;
      });
      setShowForm(false);
      setEditingId(null);
    } catch (error) {
      console.error('Error uploading study material:', error);
      const subjectName = subjects.find(subject => subject._id === formData.subject)?.subjectName || formData.subject || 'Unknown Subject';
      const classInfo = classes.find(cls => cls._id === formData.class) || {};
      const fallbackMaterial = {
        _id: editingId || `local_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        teacher: currentUser?._id,
        materialType: formData.materialType,
        class: {
          _id: formData.class,
          className: classInfo.className || 'N/A',
          section: classInfo.section || 'N/A'
        },
        subject: {
          _id: formData.subject,
          subjectName
        },
        url: formData.materialType === 'link' ? formData.externalLink : '',
        file: formData.materialType === 'link'
          ? null
          : formData.file
            ? {
                originalName: formData.file?.name,
                filename: formData.file?.name,
                size: formData.file?.size
              }
            : existingMaterial?.file || null,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        localFallback: true
      };

      setMaterials(prev => {
        const updated = editingId
          ? prev.map(material => material._id === editingId ? fallbackMaterial : material)
          : [fallbackMaterial, ...prev];
        saveStudyMaterialsToStorage(updated);
        return updated;
      });
      alert('Saved locally because the backend is not reachable right now.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study material?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/teacher/study-materials/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setMaterials(prev => {
          const updated = prev.filter(material => material._id !== id);
          saveStudyMaterialsToStorage(updated);
          return updated;
        });
      } catch (error) {
        console.error('Error deleting study material:', error);
        setMaterials(prev => {
          const updated = prev.filter(material => material._id !== id);
          saveStudyMaterialsToStorage(updated);
          return updated;
        });
      }
    }
  };

  const downloadFile = (filePath, fileName) => {
    // In a real application, this would trigger file download
    alert(`File would be downloaded: ${fileName}`);
  };

  const getSubjectBadge = (subjectName) => {
    const value = (subjectName || 'Subject').trim();
    const parts = value.split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : value.slice(0, 2);

    return initials.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[20px] border border-white/60 bg-white/70 p-5 shadow-[0_10px_30px_rgba(148,163,184,0.16)] backdrop-blur-xl">
        <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-violet-200/35 blur-3xl" />
        <div className="relative flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Study Materials</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Upload and organize study resources</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-500 hover:to-violet-500 hover:shadow-xl hover:shadow-violet-200/60"
        >
          <Upload className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          <span>Upload Material</span>
          <ArrowUpRight className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
        </div>
      </div>

      {showForm && (
        <div className="rounded-[20px] border border-white/60 bg-white/75 p-6 shadow-[0_12px_36px_rgba(148,163,184,0.18)] backdrop-blur-xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Study Material' : 'Upload New Study Material'}</h3>
              <p className="text-sm text-slate-500">Give your students clean, easy-to-find resources</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Premium layout
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                  placeholder="Material title"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Material Type *</label>
                <select
                  name="materialType"
                  value={formData.materialType}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="video">Video</option>
                  <option value="image">Image</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Class *</label>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.class}
                  className={`w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60 ${!formData.class ? 'cursor-not-allowed bg-slate-100 text-slate-400' : ''}`}
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full rounded-2xl border border-slate-200 bg-white/80 p-3.5 text-slate-900 outline-none transition-all focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                placeholder="Material description"
              />
            </div>

            {formData.materialType === 'link' ? (
              <div className="space-y-4">
                <label className="mb-2 block text-sm font-semibold text-blue-700">PASTE LINK HERE *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="url"
                    name="externalLink"
                    value={formData.externalLink}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-2xl border border-blue-100/80 bg-blue-50/35 p-4 pl-10 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100/60"
                    placeholder="https://example.com/resource"
                  />
                </div>
                <p className="text-xs italic text-slate-500">E.g., YouTube video, Google Drive document, or any web resource.</p>
              </div>
            ) : (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {getMaterialTypeLabel(formData.materialType)} *
                </label>
                <div className="rounded-[22px] border border-dashed border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 text-center">
                  <Upload className="mx-auto mb-3 h-11 w-11 text-indigo-400" />
                  <p className="mb-1 text-base font-medium text-slate-700">Click to upload or drag and drop</p>
                  {formData.materialType === 'pdf' && <p className="text-sm text-slate-400">Supports PDF format</p>}
                  {formData.materialType === 'video' && <p className="text-sm text-slate-400">Supports MP4, MKV, AVI</p>}
                  {formData.materialType === 'image' && <p className="text-sm text-slate-400">Supports JPG, PNG, GIF</p>}
                  {formData.materialType === 'document' && <p className="text-sm text-slate-400">Supports DOC, DOCX, PPT, PPTX</p>}
                  {!formData.materialType && <p className="text-sm text-slate-400">Supports all standard formats</p>}
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="mt-4 inline-flex cursor-pointer items-center rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200/60 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-200/70">
                    Select {formData.materialType ? formData.materialType.toUpperCase() : 'File'}
                  </label>
                  {formData.file && (
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all ${uploading ? 'cursor-not-allowed bg-slate-400' : 'bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-200/60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-200/70'
                  }`}
              >
                {uploading ? 'Uploading...' : editingId ? 'Update Material' : formData.materialType === 'link' ? 'Add Link' : `Upload ${getMaterialTypeLabel(formData.materialType)}`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-full bg-slate-100 px-6 py-3 font-semibold text-slate-700 transition-all hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[20px] border border-white/60 bg-white/70 shadow-[0_12px_36px_rgba(148,163,184,0.16)] backdrop-blur-xl overflow-hidden">
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">All Study Materials</h3>
              <p className="text-sm text-slate-500">A clean overview of what is available to students</p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 md:flex">
              <FileBadge2 className="h-4 w-4 text-indigo-500" />
              {materials.length} items
            </div>
          </div>
          {materials.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {materials.map(material => (
                <div
                  key={material._id}
                  className="group relative overflow-hidden rounded-[20px] border border-white/70 bg-white/75 p-5 shadow-[0_10px_30px_rgba(99,102,241,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(99,102,241,0.16)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500" />
                  <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-indigo-100/35 blur-2xl" />
                  <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-sky-100/35 blur-2xl" />
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-700 shadow-sm ring-1 ring-white/70">
                        <span className="text-sm font-extrabold tracking-wide">
                          {getSubjectBadge(material.subject?.subjectName)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h4 className="truncate text-xl font-bold text-slate-900">{material.title}</h4>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {material.class?.className} - {material.class?.section}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-0 rounded-2xl border border-white/80 bg-white/75 backdrop-blur-sm">
                      <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                        <span className="text-sm text-slate-500">Subject</span>
                        <span className="text-sm font-semibold text-slate-900">{material.subject?.subjectName}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
                        <span className="text-sm text-slate-500">Type</span>
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                          {material.materialType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-slate-500">Chapters</span>
                        <span className="text-sm font-semibold text-slate-900">{material.description ? 'Included' : 'Not set'}</span>
                      </div>
                    </div>
                    {material.description && (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                        {material.description}
                      </p>
                    )}
                    <div className="mt-5 flex items-center justify-between border-t border-slate-200/70 pt-4">
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(material.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-1 rounded-full bg-white px-1.5 py-1 shadow-sm ring-1 ring-slate-100 opacity-95 transition-all group-hover:opacity-100">
                        <button
                          onClick={() => handleDownload(material)}
                          className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(material)}
                          className="rounded-full p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(material._id)}
                          className="rounded-full p-2 text-rose-600 transition-colors hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No study materials found</p>
              <p className="text-gray-400 text-sm mt-2">Upload your first study material using the button above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMaterials;
