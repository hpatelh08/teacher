const fs = require('fs');

const path = 'client/src/components/Teacher/StudyMaterials.js';
let content = fs.readFileSync(path, 'utf-8');

const start_str = '{materials.map(material => (';
const end_str = '            ) : (';

const start_idx = content.indexOf(start_str);
const end_idx = content.indexOf(end_str, start_idx);

if (start_idx !== -1 && end_idx !== -1) {
    const q = '"'; // To be safer
    const new_card = "{" + "materials.map(material => (\n" +
                  '<div key={material._id} className="relative overflow-hidden bg-[#eff4ff] rounded-[24px] border border-indigo-100/50 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">\n' +
                    
                    ' {/* Top-Right Decorative Blob */}\n' +
                    '<div className="absolute -top-24 -right-24 w-72 h-72 bg-[#e2e9ff] rounded-full pointer-events-none"></div>\n' +

                    '{/* Header: Icon + Class */}\n' +
                    '<div className="flex items-center gap-3 text-[#312e81] font-bold mb-6 relative z-10">\n' +
                      '<BookOpen className="w-6 h-6 flex-shrink-0" />\n' +
                      '<span className="tracking-wide text-[17px]">\n' +
                        'Class {material.class?.className}{material.class?.section ?   : \'\'}\n' +
                      '</span>\n' +
                    '</div>\n' +

                    '{/* Huge Title */}\n' +
                    '<h4 \n' +
                      'className="text-[34px] lg:text-[40px] font-extrabold text-[#1e293b] mb-8 relative z-10 tracking-tight leading-tight line-clamp-2" \n' +
                      'title={material.title || \'Study Material\'}\n' +
                    '>\n' +
                      '{material.title || \'Study Material\'}\n' +
                    '</h4>\n' +

                    '{/* List of Details Rows */}\n' +
                    '<div className="space-y-1 relative z-10">\n' +
                      
                      '{/* Subject Row */}\n' +
                      '<div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
                        '<span className="text-[#64748b] font-medium text-[16px]">Subject</span>\n' +
                        '<span className="text-[#0f172a] font-bold text-[16px] text-right">\n' +
                          '{material.subject?.subjectName || \'N/A\'}\n' +
                        '</span>\n' +
                      '</div>\n' +

                      '{/* Format Row */}\n' +
                      '<div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
                        '<span className="text-[#64748b] font-medium text-[16px]">Format</span>\n' +
                        '<span className="text-[#0f172a] font-bold text-[16px] uppercase">\n' +
                          '{material.materialType || \'Doc\'}\n' +
                        '</span>\n' +
                      '</div>\n' +

                      '{/* Downloads Row */}\n' +
                      '<div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
                        '<span className="text-[#64748b] font-medium text-[16px]">Downloads</span>\n' +
                        '<span className="text-[#0f172a] font-bold text-[16px]">\n' +
                          '{material.downloadCount || 0}\n' +
                        '</span>\n' +
                      '</div>\n' +

                      '{/* Date Row */}\n' +
                      '<div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
                        '<span className="text-[#64748b] font-medium text-[16px]">Added On</span>\n' +
                        '<span className="text-[#0f172a] font-bold text-[16px]">\n' +
                          '{new Date(material.createdAt).toLocaleDateString(undefined, { year: \'numeric\', month: \'short\', day: \'numeric\' })}\n' +
                        '</span>\n' +
                      '</div>\n' +
                      
                      '{/* Actions Row */}\n' +
                      '<div className="flex justify-between items-center py-3.5 pt-6">\n' +
                        '<span className="text-[#64748b] font-medium text-[16px]">Actions</span>\n' +
                        '<div className="flex items-center gap-4">\n' +
                          '<button \n' +
                            'onClick={() => downloadFile(material.file?.path, material.file?.originalName)} \n' +
                            'className="text-[#4f46e5] hover:text-indigo-800 transition-colors" \n' +
                            'title="Download"\n' +
                          '>\n' +
                            '<Download className="w-[22px] h-[22px]" />\n' +
                          '</button>\n' +
                          '<button \n' +
                            'onClick={() => handleEdit(material)} \n' +
                            'className="text-[#059669] hover:text-green-800 transition-colors" \n' +
                            'title="Edit"\n' +
                          '>\n' +
                            '<Edit className="w-[22px] h-[22px]" />\n' +
                          '</button>\n' +
                          '<button \n' +
                            'onClick={() => handleDelete(material._id)} \n' +
                            'className="text-[#e11d48] hover:text-red-800 transition-colors" \n' +
                            'title="Delete"\n' +
                          '>\n' +
                            '<Trash2 className="w-[22px] h-[22px]" />\n' +
                          '</button>\n' +
                        '</div>\n' +
                      '</div>\n' +
                    '</div>\n' +
                  '</div>\n' +
                '))}\n            </div>\n';
    
    const new_content = content.substring(0, start_idx) + new_card + content.substring(end_idx);
    fs.writeFileSync(path, new_content, 'utf-8');
    console.log("Replace success via Node.js indexing!");
} else {
    console.log("Could not find start or end strings");
}
