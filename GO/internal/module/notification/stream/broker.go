package stream

import "sync"

type Event struct {
	Name string
	Data string
}

type Broker struct {
	mu      sync.RWMutex
	clients map[int]map[chan Event]struct{}
}

// NewBroker creates an in-memory notification stream broker.
func NewBroker() *Broker {
	return &Broker{clients: map[int]map[chan Event]struct{}{}}
}

// Subscribe registers one user connection and returns its event channel.
func (b *Broker) Subscribe(userID int) (<-chan Event, func()) {
	channel := make(chan Event, 8)
	b.mu.Lock()
	if b.clients[userID] == nil {
		b.clients[userID] = map[chan Event]struct{}{}
	}
	b.clients[userID][channel] = struct{}{}
	b.mu.Unlock()

	unsubscribe := func() {
		b.mu.Lock()
		delete(b.clients[userID], channel)
		if len(b.clients[userID]) == 0 {
			delete(b.clients, userID)
		}
		close(channel)
		b.mu.Unlock()
	}
	return channel, unsubscribe
}

// Publish sends one event to all active connections of the target users.
func (b *Broker) Publish(userIDs []int, event Event) {
	b.mu.RLock()
	defer b.mu.RUnlock()
	for _, userID := range userIDs {
		for channel := range b.clients[userID] {
			select {
			case channel <- event:
			default:
			}
		}
	}
}
