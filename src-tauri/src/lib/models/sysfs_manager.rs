use std::process::Stdio;
use std::sync::Arc;
use tokio::process::Command;
use tokio::sync::Mutex;

pub struct SysfsManager {
    sudo_validated: Arc<Mutex<bool>>,
}

impl SysfsManager {
    pub fn new() -> Self {
        SysfsManager {
            sudo_validated: Arc::new(Mutex::new(false)),
        }
    }

    /// Valida o sudo uma vez, pedindo a senha do usuário
    /// Deve ser chamado antes de usar get_value ou set_value
    /// Valida o sudo uma vez, pedindo a senha do usuário
    /// Deve ser chamado antes de usar get_value ou set_value
    pub async fn validate_sudo(&self, password: &str) -> Result<(), Box<dyn std::error::Error>> {
        let mut validated = self.sudo_validated.lock().await;

        use tokio::io::AsyncWriteExt;

        if *validated {
            // Renova o timestamp do sudo
            let mut child = Command::new("sudo")
                .arg("-S") // Read password from stdin
                .arg("-p") // Custom prompt (empty to suppress)
                .arg("")
                .arg("-v")
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()?;

            if let Some(mut stdin) = child.stdin.take() {
                stdin
                    .write_all(format!("{}\n", password).as_bytes())
                    .await?;
                stdin.flush().await?;
                drop(stdin); // Close stdin to signal end of input
            }

            let output = child.wait_with_output().await?;

            if !output.status.success() {
                *validated = false;
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!(
                    "Failed to refresh sudo (possibly incorrect password): {}",
                    stderr
                )
                .into());
            }
        } else {
            // Primeira validação - vai pedir senha
            let mut child = Command::new("sudo")
                .arg("-S") // Read password from stdin
                .arg("-p") // Custom prompt (empty to suppress)
                .arg("")
                .arg("-v")
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()?;

            if let Some(mut stdin) = child.stdin.take() {
                stdin
                    .write_all(format!("{}\n", password).as_bytes())
                    .await?;
                stdin.flush().await?;
                drop(stdin); // Close stdin to signal end of input
            }

            let output = child.wait_with_output().await?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!(
                    "Sudo validation failed (possibly incorrect password): {}",
                    stderr
                )
                .into());
            }

            *validated = true;
        }

        Ok(())
    }

    /// Invalida a sessão sudo atual
    pub async fn invalidate_sudo(&self) -> Result<(), Box<dyn std::error::Error>> {
        let mut validated = self.sudo_validated.lock().await;

        let _output = Command::new("sudo")
            .arg("-k") // kill sudo timestamp
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await?;

        *validated = false;
        Ok(())
    }

    /// Verifica se o sudo está validado e renova se necessário
    async fn ensure_sudo_valid(&self) -> Result<(), Box<dyn std::error::Error>> {
        let validated = self.sudo_validated.lock().await;

        if !*validated {
            drop(validated); // Release the lock before calling validate_sudo
            return Err("Sudo not validated. Call validate_sudo() first.".into());
        }

        // Renova o timestamp do sudo
        let output = Command::new("sudo")
            .arg("-n") // non-interactive
            .arg("-v") // validate
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await?;

        if !output.status.success() {
            drop(validated);
            let mut validated_mut = self.sudo_validated.lock().await;
            *validated_mut = false;
            return Err("Sudo session expired. Call validate_sudo() again.".into());
        }

        Ok(())
    }

    pub async fn get_value(&self, sysfs_path: &str) -> Result<String, Box<dyn std::error::Error>> {
        self.ensure_sudo_valid().await?;

        let command = format!("cat \"{}\"", sysfs_path);

        let output = Command::new("sudo")
            .arg("-n") // non-interactive
            .arg("sh")
            .arg("-c")
            .arg(&command)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Command failed: {}", stderr).into());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.trim().to_string())
    }

    pub async fn ls_directory(
        &self,
        sysfs_path: &str,
    ) -> Result<String, Box<dyn std::error::Error>> {
        self.ensure_sudo_valid().await?;

        let command = format!("ls \"{}\"", sysfs_path);

        let output = Command::new("sudo")
            .arg("-n") // non-interactive
            .arg("sh")
            .arg("-c")
            .arg(&command)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Command failed: {}", stderr).into());
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        Ok(stdout.trim().to_string())
    }

    pub async fn set_value(
        &self,

        sysfs_path: &str,
        value: &str,
    ) -> Result<(), Box<dyn std::error::Error>> {
        self.ensure_sudo_valid().await?;

        let command = format!("echo \"{}\" > \"{}\"", value, sysfs_path);

        let output = Command::new("sudo")
            .arg("-n") // non-interactive
            .arg("sh")
            .arg("-c")
            .arg(&command)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .output()
            .await?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Err(format!("Command failed: {}", stderr).into());
        }

        Ok(())
    }

    // Método conveniente para executar múltiplas operações sem validar sudo a cada vez
    // pub async fn with_sudo<F, T>(&self, operations: F) -> Result<T, Box<dyn std::error::Error>>
    // where
    //     F: FnOnce(&Self) -> tokio::task::JoinHandle<Result<T, Box<dyn std::error::Error>>>,
    //     T: Send + 'static,
    // {
    //     self.validate_sudo().await?;
    //     let handle = operations(self);
    //     handle.await?
    // }
}

impl Default for SysfsManager {
    fn default() -> Self {
        Self::new()
    }
}

impl Clone for SysfsManager {
    fn clone(&self) -> Self {
        SysfsManager {
            sudo_validated: Arc::clone(&self.sudo_validated),
        }
    }
}
