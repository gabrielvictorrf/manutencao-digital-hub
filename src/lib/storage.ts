// Sistema de armazenamento local persistente
import { OrdemServico } from '@/pages/OrdensServico';
import { Maquina } from '@/pages/Maquinas';
import { TempoParada } from '@/pages/TemposParada';

const STORAGE_KEYS = {
  ORDENS_SERVICO: 'ordens_servico',
  MAQUINAS: 'maquinas',
  TEMPOS_PARADA: 'tempos_parada',
  REQUISITANTES: 'requisitantes',
  SETORES: 'setores',
};

// Funções genéricas de armazenamento
export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error);
    return [];
  }
};

// Funções específicas para cada entidade
export const saveOrdens = (ordens: OrdemServico[]): void => {
  saveToStorage(STORAGE_KEYS.ORDENS_SERVICO, ordens);
};

export const loadOrdens = (): OrdemServico[] => {
  return loadFromStorage<OrdemServico>(STORAGE_KEYS.ORDENS_SERVICO);
};

export const saveMaquinas = (maquinas: Maquina[]): void => {
  saveToStorage(STORAGE_KEYS.MAQUINAS, maquinas);
};

export const loadMaquinas = (): Maquina[] => {
  const defaultMaquinas: Maquina[] = [
    {
      id: '1',
      codigo: 'MAQ001',
      nome: 'Torno CNC 001',
      tipo: 'Torno CNC',
      fabricante: 'Romi',
      modelo: 'Galaxy 20',
      anoFabricacao: 2020,
      numeroSerie: 'RG20-2020-001',
      localizacao: 'Setor A - Linha 1',
      status: 'operacional',
      criticidade: 'alta',
      horasOperacao: 15420,
      ultimaManutencao: '2024-01-15',
      proximaManutencao: '2024-04-15',
      criadoEm: new Date().toISOString(),
      criadoPor: 'Sistema',
    }
  ];

  const saved = loadFromStorage<Maquina>(STORAGE_KEYS.MAQUINAS);
  return saved.length > 0 ? saved : defaultMaquinas;
};

export const saveTemposParada = (tempos: TempoParada[]): void => {
  saveToStorage(STORAGE_KEYS.TEMPOS_PARADA, tempos);
};

export const loadTemposParada = (): TempoParada[] => {
  return loadFromStorage<TempoParada>(STORAGE_KEYS.TEMPOS_PARADA);
};

// Interfaces para novas entidades
export interface Requisitante {
  id: string;
  nome: string;
  setor: string;
  cargo: string;
  email: string;
  telefone: string;
  status: 'ativo' | 'inativo';
  criadoEm: string;
}

export interface Setor {
  id: string;
  nome: string;
  descricao: string;
  responsavel: string;
  status: 'ativo' | 'inativo';
  criadoEm: string;
}

// Funções para requisitantes
export const saveRequisitantes = (requisitantes: Requisitante[]): void => {
  saveToStorage(STORAGE_KEYS.REQUISITANTES, requisitantes);
};

export const loadRequisitantes = (): Requisitante[] => {
  const defaultRequisitantes: Requisitante[] = [
    {
      id: '1',
      nome: 'Carlos Silva',
      setor: 'Produção',
      cargo: 'Supervisor de Produção',
      email: 'carlos.silva@empresa.com',
      telefone: '(11) 99999-1111',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Ana Santos',
      setor: 'Qualidade',
      cargo: 'Analista de Qualidade',
      email: 'ana.santos@empresa.com',
      telefone: '(11) 99999-2222',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Roberto Lima',
      setor: 'Logística',
      cargo: 'Coordenador de Logística',
      email: 'roberto.lima@empresa.com',
      telefone: '(11) 99999-3333',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    }
  ];

  const saved = loadFromStorage<Requisitante>(STORAGE_KEYS.REQUISITANTES);
  return saved.length > 0 ? saved : defaultRequisitantes;
};

// Funções para setores
export const saveSetores = (setores: Setor[]): void => {
  saveToStorage(STORAGE_KEYS.SETORES, setores);
};

export const loadSetores = (): Setor[] => {
  const defaultSetores: Setor[] = [
    {
      id: '1',
      nome: 'Produção',
      descricao: 'Setor responsável pela fabricação dos produtos',
      responsavel: 'Carlos Silva',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '2',
      nome: 'Qualidade',
      descricao: 'Setor responsável pelo controle de qualidade',
      responsavel: 'Ana Santos',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '3',
      nome: 'Logística',
      descricao: 'Setor responsável pela movimentação de materiais',
      responsavel: 'Roberto Lima',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    },
    {
      id: '4',
      nome: 'Manutenção',
      descricao: 'Setor responsável pela manutenção dos equipamentos',
      responsavel: 'João Silva',
      status: 'ativo',
      criadoEm: new Date().toISOString(),
    }
  ];

  const saved = loadFromStorage<Setor>(STORAGE_KEYS.SETORES);
  return saved.length > 0 ? saved : defaultSetores;
};