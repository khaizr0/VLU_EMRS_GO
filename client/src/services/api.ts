const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

import type { Patient, User, Department } from '@/types';

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const getHeaders = (manualToken?: string | null, headers: Record<string, string> = {}) => {
  const baseHeaders: Record<string, string> = { ...headers };
  const token = manualToken || accessToken;
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }
  return baseHeaders;
};

export const api = {
  auth: {
    sync: async (manualToken?: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: getHeaders(manualToken, { 'Content-Type': 'application/json' }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Không thể đồng bộ tài khoản (HTTP ${response.status})`);
      }
      return response.json();
    },

    me: async (manualToken?: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(manualToken),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Không thể tải tài khoản (HTTP ${response.status})`);
      }
      return response.json();
    },
  },

  patients: {
    getAll: async (params?: { searchPhrase?: string; pageNumber?: number; pageSize?: number; fromDay?: string; toDay?: string }): Promise<{ items: Patient[], totalPages: number, totalItemsCount: number }> => {
      const queryParams = new URLSearchParams({
        pageNumber: (params?.pageNumber || 1).toString(),
        pageSize: (params?.pageSize || 30).toString(),
        ...(params?.searchPhrase && { searchPhrase: params.searchPhrase }),
        ...(params?.fromDay && { fromDay: params.fromDay }),
        ...(params?.toDay && { toDay: params.toDay })
      });
      
      const response = await fetch(`${API_BASE_URL}/patients?${queryParams}`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    },
    
    getById: async (id: number): Promise<Patient> => {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },
    
    create: async (data: {
      name: string;
      dateOfBirth: string;
      gender: number;
      ethnicityId: number;
      healthInsuranceNumber: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          throw new Error(`Failed to create patient (Status: ${response.status})`);
        }
        console.error('API Error:', error);

        if (error?.errors) {
          const messages = Object.entries(error.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          throw new Error(messages);
        }

        throw new Error(error?.title || error?.message || 'Failed to create patient');
      }

      return response.json();
    },    
    update: async (id: number, data: {
      name: string;
      dateOfBirth: string;
      gender: number;
      ethnicityId: number;
      healthInsuranceNumber: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          throw new Error(`Failed to update patient (Status: ${response.status})`);
        }
        console.error('API Error:', error);

        if (error?.errors) {
          const messages = Object.entries(error.errors)
            .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(', ')}`)
            .join('\n');
          throw new Error(messages);
        }

        throw new Error(error?.title || error?.message || 'Failed to update patient');
      }

      if (response.status === 204) {
        return;
      }
      return response.json();
    },

    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          throw new Error(`Failed to delete patient (Status: ${response.status})`);
        }
        throw new Error(error?.title || error?.message || 'Failed to delete patient');
      }
    }  },
  
  ethnicities: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/ethinicities`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch ethnicities');
      return response.json();
    }
  },

  medicalRecords: {
    getAll: async (params?: { searchPhrase?: string; pageNumber?: number; pageSize?: number; recordType?: number; fromDay?: string; toDay?: string }) => {
      const queryParams = new URLSearchParams({
        pageNumber: (params?.pageNumber || 1).toString(),
        pageSize: (params?.pageSize || 30).toString(),
        ...(params?.searchPhrase && { searchPhrase: params.searchPhrase }),
        ...(params?.recordType && { recordType: params.recordType.toString() }),
        ...(params?.fromDay && { fromDay: params.fromDay }),
        ...(params?.toDay && { toDay: params.toDay })
      });

      const response = await fetch(`${API_BASE_URL}/medical-records?${queryParams}`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch medical records');
      return response.json();
    },

    getById: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch medical record');
      return response.json();
    },

    create: async (patientId: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${patientId}`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create medical record');
      }
      return response.json();
    },

    update: async (id: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to update medical record');
      }
      if (response.status === 204) return;
      return response.json();
    },

    importPdf: async (patientId: number, file: File) => {
      const formData = new FormData();
      formData.append('FilePdf', file);
      
      const response = await fetch(`${API_BASE_URL}/medical-records/${patientId}/import-pdf`, {
        method: 'POST',
        headers: getHeaders(), 
        body: formData
      });
      if (!response.ok) {
        let errorMessage = `Failed to import PDF (Status: ${response.status})`;
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },

    delete: async (id: number) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          throw new Error(`Failed to delete medical record (Status: ${response.status})`);
        }
        throw new Error(error?.title || error?.message || 'Failed to delete medical record');
      }
    }
  },

  xRays: {
    create: async (recordId: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to create X-Ray';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.title || text;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.text(); 
    },
    changeStatus: async (recordId: number, id: number, data: { status?: number, departmentName: string }) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays/${id}`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to update X-Ray status: ${errorText}`);
      }
    },
    complete: async (recordId: number, id: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays/${id}/complete`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to complete X-Ray: ${errorText}`);
      }
    },
    importPdf: async (recordId: number, file: File) => {
      const formData = new FormData();
      formData.append('File', file);
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays/import-pdf`, {
        method: 'POST',
        headers: getHeaders(), 
        body: formData
      });
      if (!response.ok) {
        let errorMessage = `Failed to import X-Ray PDF (Status: ${response.status})`;
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    importCompleted: async (recordId: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays/import-pdf/completed`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to complete X-Ray import');
      }
    },
    delete: async (recordId: number, id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/x-rays/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete X-Ray');
    }
  },

  hematologies: {
    create: async (recordId: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to create Hematology';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.title || text;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.text(); 
    },
    changeStatus: async (recordId: number, id: number, data: { status?: number, departmentName: string }) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies/${id}`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to update Hematology status: ${errorText}`);
      }
    },
    complete: async (recordId: number, id: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies/${id}/complete`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
         const errorText = await response.text();
         throw new Error(`Failed to complete Hematology: ${errorText}`);
      }
    },
    importPdf: async (recordId: number, file: File) => {
      const formData = new FormData();
      formData.append('File', file);
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies/import-pdf`, {
        method: 'POST',
        headers: getHeaders(), 
        body: formData
      });
      if (!response.ok) {
        let errorMessage = `Failed to import Hematology PDF (Status: ${response.status})`;
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.title || errorMessage;
        } catch {
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      return response.json();
    },
    importCompleted: async (recordId: number, data: any) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies/import-pdf/completed`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to complete Hematology import');
      }
    },
    delete: async (recordId: number, id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/clinicals/hematologies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete Hematology');
    }
  },

  medicalAttachments: {
    getAll: async (recordId: number) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/attachments`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch medical attachments');
      return response.json();
    },
    create: async (recordId: number, file: File, customName?: string) => {
      const formData = new FormData();
      
      let baseName = customName || file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      // WORKAROUND FOR BACKEND BUG: Backend regex ^[\p{L}\s]+$ REJECTS NUMBERS.
      // We will count how many files exist with the exact selected type to assign the next letter.
      if (customName) {
        const match = customName.match(/([a-zA-Z]+)(\d+)$/);
        if (match) {
            const baseStr = match[1]; // e.g. "HuyetHoc"
            const num = parseInt(match[2], 10);
            
            // Map 1 -> A, 2 -> B, 26 -> Z, 27 -> AA, etc. (Simple mapping for now up to 26)
            let letter = "";
            if (num <= 26) {
                letter = String.fromCharCode(64 + num);
            } else {
                letter = String.fromCharCode(64 + Math.floor(num / 26)) + String.fromCharCode(64 + (num % 26 || 26));
            }
            baseName = `${baseStr}${letter}`;
        }
      }

      const sanitizedName = baseName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-zA-Z\s]/g, '') // Allowed: Letters and spaces ONLY (matches backend regex)
        .trim();
      
      const extension = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
      const finalFileName = `${sanitizedName}${extension}`;
      
      // Create a new File object with the sanitized name so the backend receives it exactly as we want
      const renamedFile = new File([file], finalFileName, { type: file.type });
      
      formData.append('File', renamedFile);
      formData.append('Name', sanitizedName);
      
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/attachments`, {
        method: 'POST',
        headers: getHeaders(), 
        body: formData
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload attachment: ${errorText}`);
      }
      return response.json();
    },
    delete: async (recordId: number, attachmentId: number) => {
      const response = await fetch(`${API_BASE_URL}/medical-records/${recordId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to delete attachment');
    }
  },

  identities: {
    sync: async (manualToken?: string, data?: any) => {
      const response = await fetch(`${API_BASE_URL}/identities`, {
        method: 'POST',
        headers: getHeaders(manualToken, { 'Content-Type': 'application/json' }),
        body: JSON.stringify(data || {}) 
      });

      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          throw new Error(`Failed to sync user identity (Status: ${response.status})`);
        }
        throw new Error(error?.message || 'Failed to sync user identity');
      }

      if (response.status === 201 || response.status === 200) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          // Nếu không phải JSON (có thể là ID số thuần túy), trả về trực tiếp
          const id = parseInt(text);
          return isNaN(id) ? text : id;
        }
      }
      return null;
    },

    getUser: async (userId: number, manualToken?: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/identities/users/${userId}`, {
        headers: getHeaders(manualToken)
      });
      if (!response.ok) {
        if (response.status === 403) throw new Error('403_FORBIDDEN');
        throw new Error('Failed to fetch user');
      }
      return response.json();
    },

    getAllUsers: async (manualToken?: string): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}/identities/users`, {
        headers: getHeaders(manualToken)
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },

    changeActiveStatus: async (userId: number, isActive: boolean) => {
      const response = await fetch(`${API_BASE_URL}/identities/users/${userId}/active`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ active: isActive })
      });
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(text || 'Failed to change user status');
        }
        throw new Error(error?.message || error?.title || 'Failed to change user status');
      }
    },

    updateSettings: async (userId: number, isReceivedEmail: boolean) => {
      const response = await fetch(`${API_BASE_URL}/identities/users/${userId}/settings`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ isReceivedEmail })
      });
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(text || 'Failed to update user settings');
        }
        throw new Error(error?.message || error?.title || 'Failed to update user settings');
      }
    },

    changeRole: async (userId: number, roleName: string) => {
      const response = await fetch(`${API_BASE_URL}/identities/users/${userId}/roles`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ role: roleName })
      });
      if (!response.ok) {
        let error;
        try {
          error = await response.json();
        } catch {
          const text = await response.text();
          throw new Error(text || 'Failed to change user role');
        }
        throw new Error(error?.message || error?.title || 'Failed to change user role');
      }
    }
  },

  departments: {
    getAll: async (): Promise<Department[]> => {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
    create: async (name: string): Promise<number> => {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        method: 'POST',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error('Failed to create department');
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return parseInt(text);
      }
    },
    update: async (id: number, name: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const text = await response.text();
        let errorMessage = 'Failed to update department';
        try {
          const errorData = JSON.parse(text);
          if (errorData.errors) {
            errorMessage = Object.values(errorData.errors).flat().join('\n');
          } else {
            errorMessage = errorData.message || errorData.title || text;
          }
        } catch {
          errorMessage = text;
        }
        throw new Error(errorMessage);
      }
    },
    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to delete department');
    },
    assignUser: async (departmentId: number, userId: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users/${userId}`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to assign user to department');
    },
    assignHead: async (departmentId: number, userId: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users/${userId}/head`, {
        method: 'PUT',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to assign head to department');
    },
    unassignHead: async (departmentId: number, userId: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users/${userId}/head`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to unassign head from department');
    },
    removeUser: async (departmentId: number, userId: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/departments/${departmentId}/users/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Failed to remove user from department');
    }
  },

  notifications: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    markAsRead: async (userNotificationId: number) => {
      const response = await fetch(`${API_BASE_URL}/notifications/${userNotificationId}/read`, {
        method: 'PUT',
        headers: getHeaders(null, { 'Content-Type': 'application/json' })
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
    }
  },

  statistics: {
    getDashboard: async (filters?: { fromDay?: string, toDay?: string, recordType?: number }) => {
      const query = new URLSearchParams();
      if (filters?.fromDay) query.append('fromDay', filters.fromDay);
      if (filters?.toDay) query.append('toDay', filters.toDay);
      if (filters?.recordType) query.append('recordType', filters.recordType.toString());
      
      const queryString = query.toString();
      const url = `${API_BASE_URL}/statistics/dashboard${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard statistics');
      return response.json();
    }
  }
};
