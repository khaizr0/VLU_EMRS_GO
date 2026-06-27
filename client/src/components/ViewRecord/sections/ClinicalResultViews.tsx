import React, { useEffect, useState, useRef } from "react";
import { FileText, Loader2 } from "lucide-react";
import type { XRayData } from "../../EditRecord/sections/XRayInputForm";
import type { HematologyData } from "../../EditRecord/sections/HematologyInputForm";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

// --- HELPERS ---

const formatAddress = (address: string) => {
    if (!address) return "";
    const keywords = ["Thành phố", "Tỉnh"];
    let splitIndex = -1;
    for (const kw of keywords) {
        const idx = address.indexOf(kw);
        if (idx !== -1 && (splitIndex === -1 || idx < splitIndex)) {
            splitIndex = idx;
        }
    }

    if (splitIndex <= 0) return address;

    const part1 = address.substring(0, splitIndex);
    const part2 = address.substring(splitIndex);

    return (
        <>
            {part1}
            <span style={{ display: 'inline-block' }}>{part2}</span>
        </>
    );
};

// --- REUSABLE PAPER COMPONENTS ---

export const XRayPaper = ({ data }: { data: XRayData }) => {
    const showResultSection = data.status >= 2 || data.status === 3;
    return (
        <div 
            className="w-full max-w-[800px] bg-white shadow-md p-[10mm] text-black leading-[1.4] border border-gray-200 mx-auto"
            style={{ fontFamily: 'Times New Roman, serif' }}
        >
            <div className="flex justify-between items-start mb-5">
                <div className="w-[30%]">
                    <p className="m-0 font-bold uppercase text-[8pt]">Sở Y tế: {data.healthDept || "..................."}</p>
                    <p className="m-0 font-bold uppercase text-[8pt]">Bệnh viện: {data.hospital || "..................."}</p>
                </div>
                <div className="w-[40%] text-center">
                    <h1 className="text-[10pt] font-bold uppercase m-0">Phiếu chiếu/ chụp X-Quang</h1>
                    <p className="italic m-0 text-[9pt]">(lần thứ {data.times || "................."})</p>
                </div>
                <div className="w-[30%] text-right">
                     <p className="m-0 font-bold">MS: 08/BV-02</p>
                     <p className="m-0">Số: {data.xrayNumber || "................"}</p>
                </div>
            </div>

            <div className="mb-4">
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>Họ tên người bệnh: <b className="font-bold uppercase">{data.patientName}</b></div>
                    <div style={{ width: '100px' }}>Tuổi: {data.age}</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>Nam/Nữ: {data.gender}</div>
                </div>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <div style={{ flex: 1, paddingRight: '10px', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                        - Địa chỉ: {formatAddress(data.address)}
                    </div>
                    <div style={{ width: '220px' }}></div>
                </div>

                <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>Khoa: {data.department}</div>
                    <div style={{ width: '100px' }}>Buồng: {data.room}</div>
                    <div style={{ width: '120px', textAlign: 'right' }}>Giường: {data.bed}</div>
                </div>
                <p className="m-0" style={{ wordBreak: 'normal', overflowWrap: 'anywhere' }}>Chẩn đoán: {data.diagnosis}</p>
            </div>

            <div className="mb-6 border border-black text-xs">
                 <div className="bg-gray-50 border-b border-black p-2 font-bold text-left text-black uppercase">Yêu cầu chiếu/ chụp</div>
                 <div className="p-3 min-h-[30mm] whitespace-pre-wrap break-words text-black">{data.request}</div>
            </div>

            <div className="flex justify-end mb-8">
                <div className="text-center w-1/3">
                    <p className="italic m-0">Ngày {data.requestDateDay} tháng {data.requestDateMonth} năm {data.requestDateYear}</p>
                    <p className="font-bold mt-1 mb-0 uppercase">Bác sĩ điều trị</p>
                    <div className="h-[20mm]"></div>
                    <p className="m-0 font-bold uppercase"></p>
                </div>
            </div>

            {showResultSection && (
              <>
                <div className="mb-6 border border-black text-xs">
                    <div className="bg-gray-50 border-b border-black p-2 font-bold text-left text-black uppercase">Kết quả chiếu/ chụp</div>
                    <div className="p-3 min-h-[40mm] whitespace-pre-wrap break-words text-black font-bold">{data.result}</div>
                </div>

                <div className="flex justify-between items-start">
                    <div className="w-1/2 pr-4">
                        <p className="font-bold underline mb-2">Lời dặn của BS chuyên khoa:</p>
                        <p className="whitespace-pre-wrap break-words m-0 italic">{data.advice}</p>
                    </div>
                    <div className="text-center w-1/3">
                        <p className="italic m-0">Ngày {data.resultDateDay} tháng {data.resultDateMonth} năm {data.resultDateYear}</p>
                        <p className="font-bold mt-1 mb-0 uppercase">Bác sĩ chuyên khoa</p>
                        <div className="h-[20mm]"></div>
                        <p className="m-0 font-bold uppercase"></p>
                    </div>
                </div>
              </>
            )}
        </div>
    );
};

export const HematologyPaper = ({ data }: { data: HematologyData }) => {
  return (
    <div 
        className="w-full max-w-[800px] bg-white shadow-md p-[10mm] text-black leading-[1.2] border border-gray-200 mx-auto"
        style={{ fontFamily: 'Times New Roman, serif' }}
    >
        {/* Header */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ width: '30%' }}>
                <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt' }}>Sở Y tế: {data.healthDept || "..................."}</p>
                <p style={{ margin: 0, fontWeight: 'bold', textTransform: 'uppercase', fontSize: '8pt' }}>Bệnh viện: {data.hospital || "..................."}</p>
            </div>
            <div style={{ width: '40%', textAlign: 'center' }}>
                <h1 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Phiếu Xét Nghiệm</h1>
                <h2 style={{ fontSize: '13pt', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Huyết Học</h2>
            </div>
            <div style={{ width: '30%', textAlign: 'right' }}>
                 <p style={{ margin: 0, fontWeight: 'bold' }}>MS: 17/BV-02</p>
                 <p style={{ margin: 0 }}>Số: {data.testNumber || "................"}</p>
            </div>
        </div>

        <div style={{ marginTop: '5px', marginBottom: '10px', fontSize: '10pt' }}>
             <span style={{ marginRight: '30px' }}>
                <span style={{ verticalAlign: 'middle' }}>Thường: </span>
                <span style={{ border: '1px solid #000', width: '14px', height: '14px', display: 'inline-block', textAlign: 'center', lineHeight: '12px', fontSize: '12px', verticalAlign: 'middle', marginLeft: '5px' }}>
                    {data.isEmergency ? '' : 'x'}
                </span>
             </span>
             <span>
                <span style={{ verticalAlign: 'middle' }}>Cấp cứu: </span>
                <span style={{ border: '1px solid #000', width: '14px', height: '14px', display: 'inline-block', textAlign: 'center', lineHeight: '12px', fontSize: '12px', verticalAlign: 'middle', marginLeft: '5px' }}>
                    {data.isEmergency ? 'x' : ''}
                </span>
             </span>
        </div>

        {/* Patient Info */}
        <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
                <div style={{ flex: 1 }}>- Họ tên người bệnh: <b style={{ textTransform: 'uppercase' }}>{data.patientName}</b></div>
                <div style={{ width: '100px' }}>Tuổi: {data.age}</div>
                <div style={{ width: '120px', textAlign: 'right' }}>Nam/Nữ: {data.gender}</div>
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
                <div style={{ flex: 1, paddingRight: '10px', wordBreak: 'normal', overflowWrap: 'break-word' }}>
                    - Địa chỉ: {formatAddress(data.address)}
                </div>
                <div style={{ width: '220px' }}>Số thẻ BHYT: {data.insuranceNumber}</div>
            </div>
            <div style={{ display: 'flex', marginBottom: '5px' }}>
                <div style={{ flex: 1 }}>- Khoa: {data.department}</div>
                <div style={{ width: '100px' }}>Buồng: {data.room}</div>
                <div style={{ width: '120px', textAlign: 'right' }}>Giường: {data.bed}</div>
            </div>
            <div style={{ wordBreak: 'normal', overflowWrap: 'break-word', textAlign: 'justify' }}>- Chẩn đoán: {data.diagnosis}</div>
        </div>

        {/* Content Body - Table Layout for PDF */}
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>1. Tế bào máu ngoại vi:</div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', border: '1px solid black' }}>
            <thead>
                <tr>
                    <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', width: '30%' }}>Chỉ số</th>
                    <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '20%' }}>Kết quả</th>
                    <th style={{ border: '1px solid black', padding: '4px', textAlign: 'left', width: '30%' }}>Chỉ số</th>
                    <th style={{ border: '1px solid black', padding: '4px', textAlign: 'center', width: '20%' }}>Kết quả</th>
                </tr>
            </thead>
            <tbody>
                {[
                    // Row 1
                    { 
                        l1: { l: "Số lượng HC", s: "nam (4.0-5.8); nữ (3.9-5.4 x10^12/l)", c: data.check_rbc }, v1: data.rbc,
                        l2: { l: "Số lượng BC", s: "(4-10 x 10^9/l)", c: data.check_wbc }, v2: data.wbc
                    },
                    // Row 2
                    { 
                        l1: { l: "Huyết sắc tố", s: "nam (140-160); nữ (125-145 g/l)", c: data.check_hgb }, v1: data.hgb,
                        l2: { type: 'header', l: "Thành phần bạch cầu (%):" }, v2: null
                    },
                    // Row 3
                    { 
                        l1: { l: "Hematocrit", s: "nam (0.38-0.50); nữ (0.35-0.47 l/l)", c: data.check_hct }, v1: data.hct,
                        l2: { l: "- Đoạn trung tính", c: null, indent: true }, v2: data.neutrophils
                    },
                    // Row 4
                    { 
                        l1: { l: "MCV", s: "(83-92 fl)", c: data.check_mcv }, v1: data.mcv,
                        l2: { l: "- Đoạn ưa a xít", c: null, indent: true }, v2: data.eosinophils
                    },
                    // Row 5
                    { 
                        l1: { l: "MCH", s: "(27-32 pg)", c: data.check_mch }, v1: data.mch,
                        l2: { l: "- Đoạn ưa ba zơ", c: null, indent: true }, v2: data.basophils
                    },
                    // Row 6
                    { 
                        l1: { l: "MCHC", s: "(320-356 g/l)", c: data.check_mchc }, v1: data.mchc,
                        l2: { l: "- Mono", c: null, indent: true }, v2: data.monocytes
                    },
                    // Row 7
                    { 
                        l1: { l: "Hồng cầu có nhân", s: "(0 x 10^9/l)", c: data.check_nrbc }, v1: data.nrbc,
                        l2: { l: "- Lympho", c: null, indent: true }, v2: data.lymphocytes
                    },
                    // Row 8
                    { 
                        l1: { l: "Hồng cầu lưới", s: "(0.1-0.5 %)", c: data.check_reticulocytes }, v1: data.reticulocytes,
                        l2: { l: "- Tế bào bất thường", c: null, indent: true }, v2: data.abnormalCells
                    },
                    // Row 9
                    { 
                        l1: null, v1: null,
                        l2: { l: "Số lượng tiểu cầu", s: "(150-400 x10^9/l)", c: data.check_plt }, v2: data.plt
                    },
                    // Row 10
                    { 
                        l1: null, v1: null,
                        l2: { l: "KSV sốt rét", c: data.check_malaria }, v2: data.malaria
                    },
                ].map((row, idx) => (
                    <tr key={idx}>
                        {/* Left Side */}
                        <td style={{ border: '1px solid black', padding: '4px', verticalAlign: 'middle' }}>
                            {row.l1 && (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    
                                    <div style={{ display: 'inline-block' }}>
                                        <span style={{ verticalAlign: 'middle' }}>{row.l1.l}</span>
                                        {row.l1.s && <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#444' }}>{row.l1.s}</div>}
                                    </div>
                                </div>
                            )}
                        </td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            {row.v1}
                        </td>

                        {/* Right Side */}
                        <td style={{ border: '1px solid black', padding: '4px', verticalAlign: 'middle' }}>
                            {row.l2 && (
                                <>
                                    {row.l2.type === 'header' ? (
                                        <div style={{ fontStyle: 'italic' }}>{row.l2.l}</div>
                                    ) : row.l2.type === 'esr' ? (
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            
                                            <div style={{ display: 'inline-block' }}>
                                                <span style={{ verticalAlign: 'middle' }}>{row.l2.l}</span>
                                                <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>giờ 1 (&lt; 15 mm)</div>
                                                <div style={{ fontSize: '9pt', fontStyle: 'italic' }}>giờ 2 (&lt; 20 mm)</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', paddingLeft: row.l2.indent ? '20px' : '0' }}>
                                            <span style={{ verticalAlign: 'middle' }}>{row.l2.l}</span>
                                        </div>
                                    )}
                                    {row.l2.s && <div style={{ fontSize: '9pt', fontStyle: 'italic', color: '#444', marginLeft: '20px' }}>{row.l2.s}</div>}
                                </>
                            )}
                        </td>
                        <td style={{ border: '1px solid black', padding: '4px', textAlign: 'center', fontWeight: 'bold', verticalAlign: 'middle' }}>
                            {row.l2?.type === 'esr' && typeof row.v2 === 'object' && row.v2 ? (
                                <>
                                    <div style={{ marginBottom: '5px' }}>{((row as any).v2 as any).v1}</div>
                                    <div>{((row as any).v2 as any).v2}</div>
                                </>
                            ) : (
                                row.v2 as React.ReactNode
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Section 2 & 3 - Side by Side */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <tbody>
                <tr>
                    <td style={{ width: '50%', verticalAlign: 'top', border: 'none', paddingRight: '10px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>2. Đông máu:</div>
                        <div style={{ paddingLeft: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                
                                <span style={{ verticalAlign: 'middle' }}>Thời gian máu chảy: ...........{data.bleedingTime}......... phút </span>
                            </div>
                            <div>
                                
                                <span style={{ verticalAlign: 'middle' }}>Thời gian máu đông: ...........{data.clottingTime}......... phút </span>
                            </div>
                        </div>
                    </td>
                    <td style={{ width: '50%', verticalAlign: 'top', border: 'none', paddingLeft: '10px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>3. Nhóm máu:</div>
                        <div style={{ paddingLeft: '5px' }}>
                            <div style={{ marginBottom: '5px' }}>
                                
                                <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>Hệ ABO: <b>{data.bloodGroupABO}</b></span>
                            </div>
                            <div>
                                
                                <span style={{ verticalAlign: 'middle', marginRight: '5px' }}>Hệ Rh: <b>{data.bloodGroupRh}</b></span>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>

        {/* Footer Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10pt' }}>
            <div style={{ textAlign: 'center', width: '45%' }}>
                <div>Ngày {data.requestDateDay} tháng {data.requestDateMonth} năm {data.requestDateYear}</div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>Bác sĩ điều trị</div>
                <div style={{ height: '25mm' }}></div>
                <div style={{ fontWeight: 'bold' }}></div>
            </div>
            <div style={{ textAlign: 'center', width: '45%' }}>
                <div>Ngày {data.resultDateDay} tháng {data.resultDateMonth} năm {data.resultDateYear}</div>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', marginTop: '5px' }}>Trưởng khoa xét nghiệm</div>
                <div style={{ height: '25mm' }}></div>
                <div style={{ fontWeight: 'bold' }}></div>
            </div>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: '20px', fontSize: '9pt', borderTop: '1px solid #000', paddingTop: '5px' }}>
            <b>Hướng dẫn:</b>
            <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
                <li>Quy ước quốc tế: số lượng hồng cầu, bạch cầu... tính trong đơn vị lít (l).</li>
                <li>Vì: 1.000.000.000 = 10^9 = G (Giga); 1.000.000.000.000 = 10^12 = T (Tera).</li>
                <li>Số lượng hồng cầu trước đây tính trong 1ml, ví dụ là 4 triệu; nay quy ra trong 1 lít là 4 triệu triệu/ l hay 4 x 10^12/ l hay 4T/l.</li>
            </ul>
        </div>
    </div>
  );
};

// --- PDF PREVIEWER COMPONENT ---

const ClinicalPDFPreview = ({ children, fileName }: { children: React.ReactNode, fileName: string }) => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const generatePDF = async () => {
            if (!contentRef.current) return;
            try {
                // Wait a bit for font rendering
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const canvas = await html2canvas(contentRef.current, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
                
                const blob = pdf.output("blob");
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (error) {
                console.error("Failed to generate PDF preview:", error);
            } finally {
                setLoading(false);
            }
        };

        generatePDF();
        
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, []);

    return (
        <div className="w-full">
            {/* Hidden content used for capturing */}
            <div style={{ position: 'fixed', left: '-10000px', top: '0' }}>
                <div ref={contentRef}>
                    {children}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Loader2 className="w-8 h-8 animate-spin text-vlu-red" />
                    <p className="text-sm text-gray-500 italic">Đang chuẩn bị bản in PDF...</p>
                </div>
            ) : pdfUrl ? (
                <div className="w-full h-[800px] border border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
                    <iframe 
                        src={`${pdfUrl}#toolbar=0&navpanes=0`} 
                        title={fileName} 
                        className="w-full h-full border-none"
                    />
                </div>
            ) : (
                <div className="p-10 text-center text-red-500 bg-red-50 rounded-lg border border-red-100">
                    Lỗi khi tạo bản xem trước PDF.
                </div>
            )}
        </div>
    );
};

// --- WRAPPER COMPONENTS FOR VIEWING ---

export const XRayResultView = ({ data }: { data: XRayData }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-8 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold border-b pb-2">
          <FileText size={18} className="text-vlu-red" />
          <span>Phiếu Chiếu/ Chụp X-Quang - Lần {data.times || 1}</span>
      </div>
      <ClinicalPDFPreview fileName={`XQuang_${data.patientName}.pdf`}>
          <XRayPaper data={data} />
      </ClinicalPDFPreview>
    </div>
  );
};

export const HematologyResultView = ({ data }: { data: HematologyData }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-8 overflow-hidden">
        <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold border-b pb-2">
            <FileText size={18} className="text-vlu-red" />
            <span>Phiếu Xét Nghiệm Huyết Học</span>
        </div>
        <ClinicalPDFPreview fileName={`HuyetHoc_${data.patientName}.pdf`}>
            <HematologyPaper data={data} />
        </ClinicalPDFPreview>
    </div>
  );
};

export const ClinicalResultsList = ({ documents, record }: { documents: any[], record: any }) => {
    const phieuYDocuments = (documents || []).filter(doc => 
        (doc.type === "X-Quang" || doc.type === "XN-HuyetHoc") && 
        doc.data?.status === 3
    );

    if (phieuYDocuments.length === 0) {
        return (
            <div className="bg-white p-10 text-center rounded-lg border border-dashed border-gray-300 text-gray-400 italic">
                Chưa có phiếu cận lâm sàng nào hoàn thành kết quả.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {phieuYDocuments.map((doc) => {
                // Merge patient info from record into doc.data if missing
                const enrichedData = {
                    ...doc.data,
                    patientName: doc.data?.patientName || record.patientName,
                    age: doc.data?.age || record.age,
                    gender: doc.data?.gender || record.gender,
                    address: doc.data?.address || record.address,
                    department: doc.data?.department || record.department,
                    bed: doc.data?.bed || record.bedCode,
                    insuranceNumber: doc.data?.insuranceNumber || record.insuranceNumber,
                    diagnosis: doc.data?.diagnosis || 
                               record.medicalRecordContent?.admissionDiagnosis?.mainDisease || 
                               record.diagnosisInfo?.deptDiagnosis?.name || 
                               record.diagnosisInfo?.kkbDiagnosis?.name || ""
                };

                return (
                    <div key={doc.id}>
                        {doc.type === "X-Quang" && <XRayResultView data={enrichedData} />}
                        {doc.type === "XN-HuyetHoc" && <HematologyResultView data={enrichedData} />}
                    </div>
                );
            })}
        </div>
    );
};

interface AttachmentResultViewProps {
    path: string;
    name: string;
}

export const AttachmentResultView = ({ path, name }: AttachmentResultViewProps) => {
    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(path.split('?')[0]);
    const isPdf = /\.pdf/i.test(path.split('?')[0]);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold border-b pb-2">
                <FileText size={18} className="text-vlu-red" />
                <span>{name}</span>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-md p-2 min-h-[300px] items-start">
                {isImage ? (
                    <img src={path} alt={name} className="max-w-full h-auto shadow-md rounded-sm" />
                ) : isPdf ? (
                    <div className="w-full h-[800px] border border-gray-300 rounded-sm overflow-hidden bg-white shadow-inner">
                        <iframe 
                            src={`${path}#toolbar=0&navpanes=0`} 
                            title={name} 
                            className="w-full h-full border-none"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 py-10">
                         <FileText size={48} className="text-gray-400" />
                         <p className="text-gray-600">Tài liệu đính kèm: {name}</p>
                         <a href={path} target="_blank" rel="noreferrer" className="text-vlu-red underline font-bold">Tải về / Xem</a>
                    </div>
                )}
            </div>
        </div>
    );
};
