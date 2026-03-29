const fs = require('fs');
const path = require('path');

const filePath = path.join('client', 'src', 'components', 'Teacher', 'StudyMaterials.js');
let content = fs.readFileSync(filePath, 'utf-8');

const startMarker = '{materials.map(material => (';
const endMarker = '            ) : (';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const replacement = startMarker + '\n' +
        '                  <div key={material._id} className="relative overflow-hidden bg-[#eff4ff] rounded-[24px] border border-indigo-100/50 p-6 sm:p-8 hover:shadow-lg transition-all duration-300">\n' +
        '                    \n' +
        '                    {/* Top-Right Decorative Blob */}\n' +
        '                    <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#e2e9ff] rounded-full pointer-events-none"></div>\n' +
        '\n' +
        '                    {/* Header: Icon + Class */}\n' +
        '                    <div className="flex items-center gap-3 text-[#312e81] font-bold mb-6 relative z-10">\n' +
        '                      <BookOpen className="w-6 h-6 flex-shrink-0" />\n' +
        '                      <span className="tracking-wide text-[17px]">\n' +
        '                        Class {material.class?.className}{material.class?.section ? \' \' + material.class.section : \'\'}\n' +
        '                      </span>\n' +
        '                    </div>\n' +
        '\n' +
        '                    {/* Huge Title */}\n' +
        '                    <h4 \n' +
        '                      className="text-[34px] lg:text-[40px] font-extrabold text-[#1e293b] mb-8 relative z-10 tracking-tight leading-tight line-clamp-2" \n' +
        '                      title={material.title || \'Study Material\'}\n' +
        '                    >\n' +
        '                      {material.title || \'Study Material\'}\n' +
        '                    </h4>\n' +
        '\n' +
        '                    {/* List of Details Rows */}\n' +
        '                    <div className="space-y-1 relative z-10">\n' +
        '                      \n' +
        '                      {/* Subject Row */}\n' +
        '                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
        '                        <span className="text-[#64748b] font-medium text-[16px]">Subject</span>\n' +
        '                        <span className="text-[#0f172a] font-bold text-[16px] text-right">\n' +
        '                          {material.subject?.subjectName || \'N/A\'}\n' +
        '                        </span>\n' +
        '                      </div>\n' +
        '\n' +
        '                      {/* Format Row */}\n' +
        '                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
        '                        <span className="text-[#64748b] font-medium text-[16px]">Format</span>\n' +
        '                        <span className="text-[#0f172a] font-bold text-[16px] uppercase">\n' +
        '                          {material.materialType || \'Doc\'}\n' +
        '                        </span>\n' +
        '                      </div>\n' +
        '\n' +
        '                      {/* Downloads Row */}\n' +
        '                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
        '                        <span className="text-[#64748b] font-medium text-[16px]">Downloads</span>\n' +
        '                        <span className="text-[#0f172a] font-bold text-[16px]">\n' +
        '                          {material.downloadCount || 0}\n' +
        '                        </span>\n' +
        '                      </div>\n' +
        '\n' +
        '                      {/* Date Row */}\n' +
        '                      <div className="flex justify-between items-center py-3.5 border-b border-indigo-200/50">\n' +
        '                        <span className="text-[#64748b] font-medium text-[16px]">Added On</span>\n' +
        '                        <span className="text-[#0f172a] font-bold text-[16px]">\n' +
        '                          {new Date(material.createdAt).toLocaleDateString(undefined, { year: \'numeric\', month: \'short\', day: \'numeric\' })}\n' +
        '                        </span>\n' +
        '                      </div>\n' +
        '                      \n' +
        '                      {/* Actions Row */}\n' +
        '                      <div className="flex justify-between items-center py-3.5 pt-6">\n' +
        '                        <span className="text-[#64748b] font-medium text-[16px]">Actions</span>\n' +
        '                        <div className="flex items-center gap-4">\n' +
        '                          <button \n' +
        '                            onClick={() => downloadFile(material.file?.path, material.file?.originalName)} \n' +
        '                            className="text-[#4f46e5] hover:text-indigo-800 transition-colors" \n' +
        '                            title="Download"\n' +
        '                          >\n' +
        '                            <Download className="w-[22px] h-[22px]" />\n' +
        '                          </button>\n' +
        '                          <button \n' +
        '                            onClick={() => handleEdit(material)} \n' +
        '                            className="text-[#059669] hover:text-green-800 transition-colors" \n' +
        '                            title="Edit"\n' +
        '                          >\n' +
        '                            <Edit className="w-[22px] h-[22px]" />\n' +
        '                          </button>\n' +
        '                          <button \n' +
        '                            onClick={() => handleDelete(material._id)} \n' +
        '                            className="text-[#e11d48] hover:text-red-800 transition-colors" \n' +
        '                            title="Delete"\n' +
        '                          >\n' +
        '                            <Trash2 className="w-[22px] h-[22px]" />\n' +
        '                          </button>\n' +
        '                        </div>\n' +
        '                      </div>\n' +
        '                    </div>\n' +
        '                  </div>\n' +
        '                ))}\n';

    const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log("Successfully updated StudyMaterials.js with the receipt style layout.");
} else {
    console.log("Could not find insertion points.");
}
