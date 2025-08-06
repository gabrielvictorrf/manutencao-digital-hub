// Não podemos usar hooks fora de componentes React
// Esta função deve ser chamada de dentro de um componente que tenha acesso aos hooks

/**
 * Função para limpar dados antigos de requisitantes e padronizar 
 * para usar apenas os usuários cadastrados no sistema de Configurações
 */
export const cleanupRequisitantesData = (users: any[], ordens: any[], updateOrdem: any, setRequisitantes: any) => {
  
  // Limpar lista de requisitantes antiga
  setRequisitantes([]);
  
  // Atualizar ordens existentes para vincular aos usuários do sistema
  ordens.forEach(ordem => {
    // Se a ordem tem um requisitante que não é um usuário do sistema,
    // tentar mapear pelo nome ou limpar o campo
    const requisitanteAtual = ordem.requisitanteNome;
    const usuarioEncontrado = users.find(user => 
      user.name.toLowerCase().includes(requisitanteAtual?.toLowerCase() || '') ||
      requisitanteAtual?.toLowerCase().includes(user.name.toLowerCase())
    );
    
    if (usuarioEncontrado) {
      // Atualizar ordem com o usuário encontrado
      updateOrdem(ordem.id, {
        requisitanteId: usuarioEncontrado.id,
        requisitanteNome: usuarioEncontrado.name,
        setorNome: 'N/A' // Limpar setor do requisitante pois agora usaremos setor do equipamento
      });
    } else {
      // Limpar dados do requisitante se não encontrar correspondência
      updateOrdem(ordem.id, {
        requisitanteId: '',
        requisitanteNome: 'Requisitante não identificado',
        setorNome: 'N/A'
      });
    }
  });
  
  return {
    ordensAtualizadas: ordens.length,
    usuariosDisponiveis: users.length
  };
};

/**
 * Função para verificar integridade dos dados após limpeza
 */
export const verificarIntegridadeDados = (users: any[], ordens: any[], maquinas: any[]) => {
  
  const relatorio = {
    totalOrdens: ordens.length,
    ordensComRequisitanteValido: ordens.filter(o => o.requisitanteId && users.find(u => u.id === o.requisitanteId)).length,
    ordensComMaquinaValida: ordens.filter(o => o.maquinaId && maquinas.find(m => m.id === o.maquinaId)).length,
    totalUsuarios: users.length,
    totalMaquinas: maquinas.length,
    setoresUnicos: [...new Set(maquinas.map(m => m.localizacao).filter(Boolean))].length
  };
  
  return relatorio;
};