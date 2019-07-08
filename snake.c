#include <stdlib.h>
#include <stdio.h>
#include <time.h>
#include <conio.h>

typedef struct Body{
    float x;
    float y;
    struct Body* p_next;
}Body;

typedef struct snake{
  Body* head;

  float vx;
  float vy;
  
  clock_t birth;
  clock_t death;
  int score;

  int alive;
}Snake;

const int n_players = 1;
const int HEIGHT = 16;
const int WIDTH = 16;
const float FPS_CAP = 5.0;
clock_t frame_begin;


int** fruits = NULL;
Snake** snakes = NULL;
//char*** game_boards = newBoards(n_players);

int allSnakesHaveDied();

void destructAllBodies(Snake* snk);
void destructAllFruits();
void destructAllSnakes();

void loop();

int** newFruits();
Snake** newSnakes();

void setInitialBody(Snake* snk);
void setup();

void resetAllSnakes();
void resetFruits(int begin, int end);

int updateBodies(Body* bdy, int haveAte);
void updateSnakes();

int snakeCollides(int i);
int collideWithOwnBody(int i);
int collideWithWall(int i);
int snakeHaveAte(int i);
void updateHead(Snake* snk);
Body* newBody(float x, float y);
int randomCoordinates(int XorY);
void getMovement();
void getMovementFromKeyboard(char m);
int itIsASnake(int x, int y);
int itIsAFruit(int x, int y);
void updateImage();


int main(int argc, char const *argv[]){
    setup();
    while(1){
        loop();
    }
    destructAllSnakes();
    destructAllFruits();
}

void setup(){
    srand(time(NULL));
    snakes = newSnakes();
    fruits = newFruits();
    resetAllSnakes();
    resetFruits(0, n_players);
    //turnOnBrains(n_players);
    //turnOnDisplay(HEIGHT, WIDTH);
    printf("Setup finalizado.\n");
}

void loop(){
    printf("loop iniciado.\n");
    frame_begin = clock();
    if(allSnakesHaveDied()){
        resetAllSnakes();
        //reset fruits from 0 -> n_players
        resetFruits(0, n_players);
    }
    else{
        getMovement();
        updateSnakes();
        updateImage();
    }
    printf("Esperando por tick cap.\n");
    while(clock() - frame_begin < 1.0 * CLOCKS_PER_SEC / FPS_CAP){
    }
    printf("loop finalizado.\n");
}

void updateImage(){
    system("cls");
    int i = 0;
    int j = 0;
    for(i = 0; i < HEIGHT+1; i++){
        for(j = 0; j < WIDTH+1; j++){
            if(itIsASnake(j, i)){
                printf(" O");
            }
            else if(itIsAFruit(j, i)){
                printf(" X");
            }
            else if(j == 0 || j == WIDTH){
                printf(" |");
            } 
            else if(i == 0 || i == HEIGHT){
                printf(" -");
            }
            else{
                printf("  ");
            }         
        }
        printf("\n");
    }
}

int itIsASnake(int x, int y){
    int i;
    Body* temp = NULL;
    for(i = 0; i < n_players; i++){
        temp = snakes[i]->head;
        while(temp){
            if((int) temp->x == x && (int) temp->y == y){
                return 1;
            }
            temp = temp->p_next;
        }
    }
    return 0;
}

int itIsAFruit(int x, int y){
    int i;
    for(i = 0; i < n_players; i++){
        if(fruits[i][0] == x && fruits[i][1] == y){
            return 1;
        }
    }
    return 0;
}

Snake** newSnakes(){
    Snake** snks = NULL;
    snks = (Snake**)malloc(sizeof(Snake*) * n_players);

    int i;
    for(i = 0; i < n_players; i++){
        snks[i] = (Snake*)malloc(sizeof(Snake));
    }

    return snks;
}

int** newFruits(){
    int** frts = NULL;
    frts = (int**)malloc(sizeof(int*)*n_players);

    int i;
    for(i = 0; i < n_players; i++){
        frts[i] = (int*)malloc(sizeof(int)*2);
    }

    return frts;
}

void destructAllSnakes(){
    if(snakes){
        int i;
        for(i = 0; i < n_players; i++){
            if(snakes[i]){
                destructAllBodies(snakes[i]);
                free(snakes[i]);
            }
        }
        free(snakes);
    }
}

void destructAllBodies(Snake* snk){
    Body* next = snk->head;
    Body* aux = NULL;
    while(next){
        aux = next;
        next = aux->p_next;
        free(aux);
    }
}

void destructAllFruits(){
    if(fruits){
        int i;
        for(i = 0; i < n_players; i++){
            if(fruits[i]){
                free(fruits[i]);
            }
        }
        free(fruits);
    }
}

void resetAllSnakes(){
    int i; 
    for(i = 0; i < n_players; i++){
        setInitialBody(snakes[i]);        
        snakes[i]->vx = 1;
        snakes[i]->vy = 0;
        snakes[i]->score = 0;
        snakes[i]->birth = clock();
        snakes[i]->death = -1;
        snakes[i]->alive = 1;
        setInitialBody(snakes[i]);
    }
}

void setInitialBody(Snake* snk){
    snk->head = newBody(WIDTH/2.0, HEIGHT/2.0);
    updateBodies(snk->head, 1);
    updateHead(snk);
    updateBodies(snk->head, 1);
    updateHead(snk);
    updateBodies(snk->head, 1);
    updateHead(snk);
}

int updateBodies(Body* bdy, int haveAte){
    if(bdy->p_next){
        if(updateBodies(bdy->p_next, haveAte)){
            //reach the last body
            bdy->p_next->x = bdy->x;
            bdy->p_next->y = bdy->y;
            return 1;
        }
    }
    else if(haveAte){
        bdy->p_next = newBody(bdy->x, bdy->y);
    }
    return 1;
}

void updateSnakes(){
    printf("atualizando snakes.\n");
    int i;
    for(i = 0; i < n_players; i++){
        if(snakes[i]->alive){
            printf("atulizando corpos da snake %d\n", i);
            updateBodies(snakes[i]->head, snakeHaveAte(i));
            printf("atulizando a cabeca da snake %d\n", i);
            updateHead(snakes[i]);
            if(snakeCollides(i)){
                printf("snake %d colidiu.\n", i);
                snakes[i]->alive = 0;
                snakes[i]->death = clock();
            }
        }
    }
    printf("snakes atualizadas.\n");
}

int snakeCollides(int i){
    printf("checando colisao da snake .\n");
    if(collideWithOwnBody(i) || collideWithWall(i)){
        return 1;
    }
    return 0;
}

int collideWithOwnBody(int i){
    printf("checando colisao da snake %d com seu proprio corpo.\n", i);
    Body* tmp = snakes[i]->head->p_next;
    while(tmp){
        if(tmp->x == snakes[i]->head->x &&
           tmp->y == snakes[i]->head->y ){
            return 1;
        }
        tmp = tmp->p_next;
    }
    return 0;
}

int collideWithWall(int i){
    printf("checando colisao da snake %d com as paredes.\n", i);
    if(snakes[i]->head->x <= 0 || snakes[i]->head->x >= WIDTH || 
       snakes[i]->head->y <= 0 || snakes[i]->head->y >= HEIGHT){
       return 1;
    }
    return 0;
}

int snakeHaveAte(int i){
    if(snakes[i]->head->x + snakes[i]->vx == fruits[i][0] &&
       snakes[i]->head->y + snakes[i]->vy == fruits[i][1] ){
        resetFruits(i, i+1);
        return 1;
    }
    return 0;
}

void updateHead(Snake* snk){
    snk->head->x += snk->vx;
    snk->head->y += snk->vy;
}

Body* newBody(float x, float y){
    Body* bdy = (Body*)malloc(sizeof (Body));
    bdy->x = x;
    bdy->y = y;
    bdy->p_next = NULL;
    return bdy;
}

void resetFruits(int begin, int end){
    int i;
    for(i = begin; i < end; i++){
        fruits[i][0] = randomCoordinates(0);
        fruits[i][1] = randomCoordinates(1);
    }
}

int randomCoordinates(int XorY){
    int coordinate = 0;
    if(XorY == 0){
        coordinate = 1 + (rand() % (WIDTH - 1));
    }
    else if(XorY == 1){
        coordinate = 1 + (rand() % (HEIGHT-1));
    }
    return coordinate;
}

void getMovement(){
    //the real version communicate with Tiva C for snakes commands
   // getMovementFromKeyboard();
}

void getMovementFromKeyboard(char m){
    
//	if(kbhit()) {
        printf("pressionamento de tecla detectado.\n");
        //char m = getch();
        m = 'd';
        switch (m)
        {
            case 'a':
                snakes[0]->vx = -1;
                snakes[0]->vy = 0;
                break;
            
            case 'w':
                snakes[0]->vx = 0;
                snakes[0]->vy = -1;
                break;
            
            case 's':
                snakes[0]->vx = 0;
                snakes[0]->vy = 1;
                break;
            
            case 'd':
                snakes[0]->vx = 1;
                snakes[0]->vy = 0;
                break;
            
            default:
                break;
        }
  //  }
}

int allSnakesHaveDied(){
    int i = 0;
    for(i = 0; i < n_players; i++){
        if(snakes[i]->alive){
            return 0;
        }
    }
    return 1;
}
