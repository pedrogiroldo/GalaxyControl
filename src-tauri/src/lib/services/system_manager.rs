use crate::models::sysfs_manager::SysfsManager;
use std::sync::Arc;
use tokio::sync::OnceCell;

static GLOBAL_SYSFS_MANAGER: OnceCell<Arc<SysfsManager>> = OnceCell::const_new();

pub struct SystemManager;

impl SystemManager {
    /// Inicializa o sistema global - deve ser chamado uma vez ao abrir o app
    /// Esta função vai pedir a senha do sudo
    pub async fn initialize(password: &str) -> Result<(), Box<dyn std::error::Error>> {
        let sysfs_manager = SysfsManager::new();

        // Valida o sudo uma única vez na inicialização
        println!("Initializing system permissions...");
        sysfs_manager.validate_sudo(password).await?;
        println!("System permissions validated successfully!");

        // Armazena na instância global
        GLOBAL_SYSFS_MANAGER
            .set(Arc::new(sysfs_manager))
            .map_err(|_| "SystemManager already initialized")?;

        Ok(())
    }

    /// Obtém a instância global do SysfsManager
    /// Retorna erro se o sistema não foi inicializado
    pub fn get_sysfs_manager() -> Result<Arc<SysfsManager>, Box<dyn std::error::Error>> {
        GLOBAL_SYSFS_MANAGER.get().cloned().ok_or_else(|| {
            "SystemManager not initialized. Call SystemManager::initialize() first.".into()
        })
    }

    /// Verifica se o sistema foi inicializado
    pub fn is_initialized() -> bool {
        GLOBAL_SYSFS_MANAGER.get().is_some()
    }

    /// Invalida o sudo global - opcional para limpeza ao fechar o app
    pub async fn shutdown() -> Result<(), Box<dyn std::error::Error>> {
        if let Some(sysfs_manager) = GLOBAL_SYSFS_MANAGER.get() {
            sysfs_manager.invalidate_sudo().await?;
            println!("System permissions invalidated");
        }
        Ok(())
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     #[tokio::test]
//     async fn test_system_manager_initialization() {
//         // Reset para o teste (em ambiente real isso não é necessário)
//         assert!(!SystemManager::is_initialized());

//         // Note: Este teste não vai funcionar em CI/CD sem sudo configurado
//         // Em um ambiente real, você inicializaria assim:
//         // SystemManager::initialize().await.unwrap();
//         // assert!(SystemManager::is_initialized());
//     }

//     #[test]
//     fn test_get_sysfs_manager_before_init() {
//         // Deve retornar erro se não foi inicializado
//         let result = SystemManager::get_sysfs_manager();
//         assert!(result.is_err());
//     }
// }

#[tauri::command]
pub async fn authenticate(password: &str) -> Result<(), String> {
    match SystemManager::initialize(password).await {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to initialize SystemManager: {:?}", e)),
    }
}
