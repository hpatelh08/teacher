const fs = require('fs');

const path = 'client/src/components/Teacher/StudyMaterials.js';
let content = fs.readFileSync(path, 'utf-8');

const start_str = '{materials.map(material => (';
const end_str = '            ) : (';

const start_idx = content.indexOf(start_str);
const end_idx = content.indexOf(end_str, start_idx);

if (start_idx !== -1 && end_idx !== -1) {
    const new_card = {materials.map(material => (
                  <div key={material._id} className="relative overflow-hidden bg-[#eff4ff] rounded-[24px] border border-indigo-100/50 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">    

                    {/* Top-Right Decorative Blob */}
                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#e2e9ff] rounded-full pointer-events-none"></div>

                    {/* Header: Icon + Class */}
                    <div className="flex items-center gap-3 text-[#312e81] font-bold mb-6 relative z-10">   
                      <BookOpen className="w-6 h-6 flex-shrink-0" />
                      <span className="tracking-wide text-[17px]">
                        Class {material.class?.className}{material.class?.section ? \ \\ : ''}  
                      </span>  
                    </div>     

                    {/* Huge Title */}
                    <h4        
                      className="text-[34px] lg:text-[40px] font-extrabold text-[#1e293b] mb-8 relative z-10 tracking-tight leading-tight line-clamp-2"  
                      title={material.title || 'Study Material'}
                    >
                      {material.title || 'Study Material'}    
                    </h4>      

                    {/* List of Details Rows */}
                    <div className="space-y-1 relative z-10"> 

                      {/* Subject Row */}
                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">
                        <span className="text-[#64748b] font-medium text-[16px]">Subject</span>
                        <span className="text-[#0f172a] font-bold text-[16px] text-right">   
                          {material.subject?.subjectName || 'N/A'}
                        </span>
                      </div>   

                      {/* Format Row */}
                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">
                        <span className="text-[#64748b] font-medium text-[16px]">Format</span>
                        <span className="text-[#0f172a] font-bold text-[16px] uppercase">    
                          {material.materialType || 'Doc'}    
                        </span>
                      </div>   

                      {/* Downloads Row */}
                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">
                        <span className="text-[#64748b] font-medium text-[16px]">Downloads</span>
                        <span className="text-[#0f172a] font-bold text-[16px]">
                          {material.downloadCount || 0}       
                        </span>
                      </div>   

                      {/* Date Row */}
                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">
                        <span className="text-[#64748b] font-medium text-[16px]">Added On</span>
                        <span className="text-[#0f172a] font-bold text-[16px]">
                          {new Date(material.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>   

                      {/* Actions Row */}
                      <div className="flex justify-between items-center py-3.5 pt-6">        
                        <span className="text-[#64748b] font-medium text-[16px]">Actions</span>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => downloadFile(material.file?.path, material.file?.originalName)}
                            className="text-[#4f46e5] hover:text-indigo-800 transition-colors"
                            title="Download"
                          >    
                            <Download className="w-[22px] h-[22px]" />
                          </button>
                          <button
                            onClick={() => handleEdit(material)}
                            className="text-[#059669] hover:text-green-800 transition-colors"

                            title="Edit"
                          >    
                            <Edit className="w-[22px] h-[22px]" />
                          </button>
                          <button
                            onClick={() => handleDelete(material._id)}
                            className="text-[#e11d48] hover:text-red-800 transition-colors"  
                            title="Delete"
                          >    
                            <Trash2 className="w-[22px] h-[22px]" />
                          </button>
                        </div> 
                      </div>   
                    </div>     
                  </div>       
                ))}
            </div>
\;
    const new_content = content.substring(0, start_idx) + new_card + content.substring(end_idx);
    fs.writeFileSync(path, new_content, 'utf-8');
    console.log("Replace success via Node.js indexing!");     
} else {
    console.log("Could not find start or end strings");       
}
