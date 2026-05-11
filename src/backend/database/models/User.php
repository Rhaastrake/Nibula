<?php
declare(strict_types=1);

require_once __DIR__ . '/../Database.php';

class User {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAll(): array {
        return $this->db->query("SELECT id, nickname, email, created_at FROM users")->fetchAll();
    }

    public function getById(int $id): ?array {
        $stmt = $this->db->prepare("SELECT id, nickname, email, created_at FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        return $stmt->fetch() ?: null;
    }

    public function findByEmail(string $email): ?array {
        $stmt = $this->db->prepare("SELECT id, nickname, email, password, created_at FROM users WHERE email = :email");
        $stmt->execute(['email' => filter_var(trim($email), FILTER_SANITIZE_EMAIL)]);
        return $stmt->fetch() ?: null;
    }

    public function create(string $nickname, string $email, string $password = ''): int {
        $stmt = $this->db->prepare("INSERT INTO users (nickname, email, password) VALUES (:nickname, :email, :password)");
        $stmt->execute([
            'nickname' => htmlspecialchars(strip_tags(trim($nickname))),
            'email'    => filter_var(trim($email), FILTER_SANITIZE_EMAIL),
            'password' => $password !== '' ? password_hash($password, PASSWORD_BCRYPT) : '',
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool {
        $fields = [];
        $params = ['id' => $id];

        if (isset($data['nickname'])) {
            $fields[] = 'nickname = :nickname';
            $params['nickname'] = htmlspecialchars(strip_tags($data['nickname']));
        }
        if (isset($data['email'])) {
            $fields[] = 'email = :email';
            $params['email'] = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
        }

        if (empty($fields)) return false;

        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = :id";
        return $this->db->prepare($sql)->execute($params);
    }

    public function delete(int $id): bool {
        return $this->db->prepare("DELETE FROM users WHERE id = :id")->execute(['id' => $id]);
    }
}