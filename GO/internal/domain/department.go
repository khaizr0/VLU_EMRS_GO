package domain

import "time"

type Department struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	HeadUserID *int      `json:"headUserId,omitempty"`
	HeadUser   *User     `json:"headUser,omitempty"`
	Users      []User    `json:"users"`
	CreatedAt  time.Time `json:"createdAt"`
}
